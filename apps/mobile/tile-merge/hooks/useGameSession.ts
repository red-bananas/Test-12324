import { useCallback, useEffect, useReducer, useState } from "react";
import { gameOverResumeMoveCount, resolveUndoButtonState } from "../game/undoUi";
import { detectNewMilestone } from "../game/milestones";
import {
  triggerInvalidMoveHaptic,
  triggerMergeHaptic,
} from "../game/haptics";
import { monetizationConfig } from "../game/monetization";
import { requestRewardedAction } from "../game/rewards";
import type { GameSession } from "../game/sessionTypes";
import { defaultSettings, loadSettings, type GameSettings } from "../game/settings";
import {
  applyMove,
  continueAfterWin,
  createInitialState,
  type Direction,
  type MoveResult,
  resetGame,
} from "../game/state";
import {
  addSpawnedTile,
  createTilesFromGrid,
  highestTileValue,
  moveTiles,
  resetTileIds,
  syncTileIdCounter,
  ensureUniqueTileIds,
  type DisplayTile,
} from "../game/tiles";

export interface MoveFeedback {
  type: "move" | "invalid";
  pointsGained: number;
  merged: boolean;
  milestone: number | null;
}

export type { GameSession } from "../game/sessionTypes";

type SessionAction =
  | {
      type: "MOVE_APPLIED";
      result: MoveResult;
      nextTiles: DisplayTile[];
    }
  | { type: "NEW_GAME"; random?: () => number }
  | { type: "UNDO" }
  | { type: "REWARDED_UNDO" }
  | { type: "CONTINUE" }
  | { type: "HYDRATE_BEST"; best: number }
  | { type: "RESTORE"; session: GameSession };

const HISTORY_LIMIT = 10;

export function createSession(best = 0, random?: () => number): GameSession {
  resetTileIds();
  const game = createInitialState(best, random);
  const tiles = createTilesFromGrid(game.grid);
  syncTileIdCounter(tiles);
  return {
    game,
    tiles,
    history: [],
    freeUndosLeft: monetizationConfig.freeUndosPerGame,
    rewardedUndosUsed: 0,
    gameOverResumeUndosUsed: 0,
    moveCount: 0,
  };
}

function buildNextTiles(
  currentTiles: DisplayTile[],
  direction: Direction,
  result: MoveResult,
): DisplayTile[] {
  syncTileIdCounter(currentTiles);
  let nextTiles: DisplayTile[] = moveTiles(currentTiles, direction).tiles.map(
    (tile) => ({
      ...tile,
      isNew: false,
      merged: tile.merged ?? false,
    }),
  );

  if (result.spawn) {
    nextTiles = addSpawnedTile(nextTiles, result.spawn);
  }

  return nextTiles;
}

export function sessionReducer(
  session: GameSession,
  action: SessionAction,
): GameSession {
  switch (action.type) {
    case "MOVE_APPLIED": {
      if (!action.result.moved) {
        return session;
      }

      return {
        game: action.result.state,
        tiles: action.nextTiles,
        history: [
          ...session.history.slice(-(HISTORY_LIMIT - 1)),
          { game: session.game, tiles: session.tiles },
        ],
        freeUndosLeft: session.freeUndosLeft,
        rewardedUndosUsed: session.rewardedUndosUsed,
        gameOverResumeUndosUsed: session.gameOverResumeUndosUsed,
        moveCount: session.moveCount + 1,
      };
    }
    case "NEW_GAME": {
      resetTileIds();
      const game = resetGame(session.game.best, action.random);
      const tiles = createTilesFromGrid(game.grid);
      syncTileIdCounter(tiles);
      return {
        game,
        tiles,
        history: [],
        freeUndosLeft: monetizationConfig.freeUndosPerGame,
        rewardedUndosUsed: 0,
        gameOverResumeUndosUsed: 0,
        moveCount: 0,
      };
    }
    case "UNDO": {
      if (session.history.length === 0 || session.freeUndosLeft <= 0) {
        return session;
      }
      const previous = session.history[session.history.length - 1];
      syncTileIdCounter(previous.tiles);
      return {
        game: previous.game,
        tiles: previous.tiles,
        history: session.history.slice(0, -1),
        freeUndosLeft: session.freeUndosLeft - 1,
        rewardedUndosUsed: session.rewardedUndosUsed,
        gameOverResumeUndosUsed: session.gameOverResumeUndosUsed,
        moveCount: Math.max(0, session.moveCount - 1),
      };
    }
    case "REWARDED_UNDO": {
      if (session.history.length === 0) {
        return session;
      }
      const wasLost = session.game.status === "lost";

      if (wasLost) {
        if (session.gameOverResumeUndosUsed > 0) {
          return session;
        }

        const steps = Math.min(
          monetizationConfig.maxResumeUndosOnGameOver,
          session.history.length,
        );
        let history = session.history;
        let game = session.game;
        let tiles = session.tiles;
        let moveCount = session.moveCount;

        for (let step = 0; step < steps; step += 1) {
          const previous = history[history.length - 1];
          game = previous.game;
          tiles = previous.tiles;
          history = history.slice(0, -1);
          moveCount = Math.max(0, moveCount - 1);
        }

        syncTileIdCounter(tiles);
        return {
          game,
          tiles,
          history,
          freeUndosLeft: session.freeUndosLeft,
          rewardedUndosUsed: session.rewardedUndosUsed + 1,
          gameOverResumeUndosUsed: 1,
          moveCount,
        };
      }

      const previous = session.history[session.history.length - 1];
      syncTileIdCounter(previous.tiles);
      return {
        game: previous.game,
        tiles: previous.tiles,
        history: session.history.slice(0, -1),
        freeUndosLeft: session.freeUndosLeft,
        rewardedUndosUsed: session.rewardedUndosUsed + 1,
        gameOverResumeUndosUsed: session.gameOverResumeUndosUsed,
        moveCount: Math.max(0, session.moveCount - 1),
      };
    }
    case "CONTINUE":
      return {
        ...session,
        game: continueAfterWin(session.game),
      };
    case "HYDRATE_BEST":
      return {
        ...session,
        game: {
          ...session.game,
          best: Math.max(session.game.best, action.best),
        },
      };
    case "RESTORE": {
      const tiles = ensureUniqueTileIds(action.session.tiles);
      return {
        ...action.session,
        tiles,
        freeUndosLeft:
          typeof action.session.freeUndosLeft === "number"
            ? action.session.freeUndosLeft
            : monetizationConfig.freeUndosPerGame,
        rewardedUndosUsed:
          typeof action.session.rewardedUndosUsed === "number"
            ? Math.max(0, action.session.rewardedUndosUsed)
            : 0,
        gameOverResumeUndosUsed:
          typeof action.session.gameOverResumeUndosUsed === "number"
            ? Math.max(0, action.session.gameOverResumeUndosUsed)
            : 0,
        moveCount: action.session.moveCount ?? 0,
      };
    }
    default:
      return session;
  }
}

export function useGameSession(initialBest = 0) {
  const [session, dispatch] = useReducer(
    sessionReducer,
    initialBest,
    (best) => createSession(best),
  );
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [moveFeedback, setMoveFeedback] = useState<MoveFeedback | null>(null);
  const [rewardedUndoPending, setRewardedUndoPending] = useState(false);

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, []);

  const move = useCallback(
    (direction: Direction, random = Math.random) => {
      const result = applyMove(session.game, direction, random);
      if (!result.moved) {
        void triggerInvalidMoveHaptic(settings.hapticsEnabled);
        setMoveFeedback({
          type: "invalid",
          pointsGained: 0,
          merged: false,
          milestone: null,
        });
        return;
      }

      const previousMax = highestTileValue(session.tiles);
      const nextTiles = buildNextTiles(session.tiles, direction, result);
      const milestone = detectNewMilestone(previousMax, highestTileValue(nextTiles));

      if (result.merged) {
        void triggerMergeHaptic(result.maxTileMerged, settings.hapticsEnabled);
      }

      setMoveFeedback({
        type: "move",
        pointsGained: result.pointsGained,
        merged: result.merged,
        milestone,
      });
      dispatch({ type: "MOVE_APPLIED", result, nextTiles });
    },
    [session, settings.hapticsEnabled],
  );

  const newGame = useCallback((random?: () => number) => {
    setMoveFeedback(null);
    dispatch({ type: "NEW_GAME", random });
  }, []);

  const undo = useCallback(() => {
    if (session.history.length === 0 || session.freeUndosLeft <= 0) {
      return;
    }
    setMoveFeedback(null);
    dispatch({ type: "UNDO" });
  }, [session.freeUndosLeft, session.history.length]);

  const rewardedUndo = useCallback(async () => {
    if (session.history.length === 0 || session.freeUndosLeft > 0) {
      return;
    }
    if (session.game.status === "lost") {
      if (session.gameOverResumeUndosUsed > 0) {
        return;
      }
    } else if (session.game.status !== "playing") {
      return;
    }

    setRewardedUndoPending(true);
    try {
      const granted = await requestRewardedAction("undo");
      if (!granted) {
        return;
      }
      setMoveFeedback(null);
      dispatch({ type: "REWARDED_UNDO" });
    } finally {
      setRewardedUndoPending(false);
    }
  }, [
    session.freeUndosLeft,
    session.game.status,
    session.gameOverResumeUndosUsed,
    session.history.length,
  ]);

  const requestUndo = useCallback(() => {
    if (session.history.length === 0) {
      return;
    }
    if (session.freeUndosLeft > 0) {
      undo();
      return;
    }
    if (session.game.status === "playing" || session.game.status === "lost") {
      void rewardedUndo();
    }
  }, [
    rewardedUndo,
    session.freeUndosLeft,
    session.game.status,
    session.history.length,
    undo,
  ]);

  const continuePlaying = useCallback(() => {
    dispatch({ type: "CONTINUE" });
  }, []);

  const hydrateBest = useCallback((best: number) => {
    if (best > 0) {
      dispatch({ type: "HYDRATE_BEST", best });
    }
  }, []);

  const restoreSession = useCallback((saved: GameSession) => {
    setMoveFeedback(null);
    dispatch({ type: "RESTORE", session: saved });
  }, []);

  const clearMoveFeedback = useCallback(() => {
    setMoveFeedback(null);
  }, []);

  const updateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
  }, []);

  const highestTile = highestTileValue(session.tiles);
  const resumeUndosRemaining = gameOverResumeMoveCount(
    session.gameOverResumeUndosUsed > 0,
    session.history.length,
    monetizationConfig.maxResumeUndosOnGameOver,
  );

  const undoState = resolveUndoButtonState({
    hasHistory: session.history.length > 0,
    freeUndosLeft: session.freeUndosLeft,
    gameStatus: session.game.status,
    resumeUndosRemaining,
  });

  return {
    session,
    move,
    newGame,
    undo,
    rewardedUndo,
    requestUndo,
    continuePlaying,
    hydrateBest,
    restoreSession,
    resumeUndosRemaining,
    rewardedUndoPending,
    undoState,
    freeUndosLeft: session.freeUndosLeft,
    moveCount: session.moveCount,
    highestTile,
    moveFeedback,
    clearMoveFeedback,
    settings,
    updateSettings,
  };
}
