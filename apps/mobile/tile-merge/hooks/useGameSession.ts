import { useCallback, useEffect, useReducer, useState } from "react";
import { detectNewMilestone } from "../game/milestones";
import {
  triggerInvalidMoveHaptic,
  triggerMergeHaptic,
} from "../game/haptics";
import { defaultSettings, loadSettings, type GameSettings } from "../game/settings";
import {
  applyMove,
  continueAfterWin,
  createInitialState,
  type Direction,
  type GameState,
  type MoveResult,
  resetGame,
} from "../game/state";
import {
  addSpawnedTile,
  createTilesFromGrid,
  highestTileValue,
  moveTiles,
  resetTileIds,
  type DisplayTile,
} from "../game/tiles";

export interface GameSession {
  game: GameState;
  tiles: DisplayTile[];
  history: Array<{ game: GameState; tiles: DisplayTile[] }>;
}

export interface MoveFeedback {
  type: "move" | "invalid";
  pointsGained: number;
  merged: boolean;
  milestone: number | null;
}

type SessionAction =
  | {
      type: "MOVE_APPLIED";
      result: MoveResult;
      nextTiles: DisplayTile[];
    }
  | { type: "NEW_GAME"; random?: () => number }
  | { type: "UNDO" }
  | { type: "CONTINUE" }
  | { type: "HYDRATE_BEST"; best: number };

const HISTORY_LIMIT = 10;

export function createSession(best = 0, random?: () => number): GameSession {
  resetTileIds();
  const game = createInitialState(best, random);
  return {
    game,
    tiles: createTilesFromGrid(game.grid),
    history: [],
  };
}

function buildNextTiles(
  currentTiles: DisplayTile[],
  direction: Direction,
  result: MoveResult,
): DisplayTile[] {
  let nextTiles = moveTiles(currentTiles, direction).tiles.map((tile) => ({
    ...tile,
    isNew: false,
    merged: tile.merged ?? false,
  }));

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
      };
    }
    case "NEW_GAME": {
      resetTileIds();
      const game = resetGame(session.game.best, action.random);
      return {
        game,
        tiles: createTilesFromGrid(game.grid),
        history: [],
      };
    }
    case "UNDO": {
      if (session.history.length === 0) {
        return session;
      }
      const previous = session.history[session.history.length - 1];
      return {
        game: previous.game,
        tiles: previous.tiles,
        history: session.history.slice(0, -1),
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
    setMoveFeedback(null);
    dispatch({ type: "UNDO" });
  }, []);

  const continuePlaying = useCallback(() => {
    dispatch({ type: "CONTINUE" });
  }, []);

  const hydrateBest = useCallback((best: number) => {
    if (best > 0) {
      dispatch({ type: "HYDRATE_BEST", best });
    }
  }, []);

  const clearMoveFeedback = useCallback(() => {
    setMoveFeedback(null);
  }, []);

  const updateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
  }, []);

  return {
    session,
    move,
    newGame,
    undo,
    continuePlaying,
    hydrateBest,
    canUndo: session.history.length > 0,
    moveFeedback,
    clearMoveFeedback,
    settings,
    updateSettings,
  };
}
