import {
  applyMove,
  createInitialState,
} from "../game/state";
import { addSpawnedTile, createTilesFromGrid, moveTiles, type DisplayTile } from "../game/tiles";
import {
  createSession,
  sessionReducer,
} from "../hooks/useGameSession";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("../game/haptics", () => ({
  triggerMergeHaptic: jest.fn(),
  triggerInvalidMoveHaptic: jest.fn(),
}));

function applyMoveToSession(
  session: ReturnType<typeof createSession>,
  direction: "up" | "down" | "left" | "right",
  random?: () => number,
) {
  const result = applyMove(session.game, direction, random);
  if (!result.moved) {
    return session;
  }

  let nextTiles: DisplayTile[] = moveTiles(session.tiles, direction).tiles.map(
    (tile) => ({
      ...tile,
      isNew: false,
      merged: tile.merged ?? false,
    }),
  );
  if (result.spawn) {
    nextTiles = addSpawnedTile(nextTiles, result.spawn);
  }

  return sessionReducer(session, {
    type: "MOVE_APPLIED",
    result,
    nextTiles,
  });
}

describe("game session reducer", () => {
  it("records history and updates score on a valid move", () => {
    const grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const session = {
      ...createSession(),
      game: {
        ...createInitialState(),
        grid,
      },
      tiles: createTilesFromGrid(grid),
      freeUndosLeft: 3,
      rewardedUndosUsed: 0,
      moveCount: 0,
    };

    const next = applyMoveToSession(session, "left", () => 0.1);

    expect(next.game.score).toBe(4);
    expect(next.moveCount).toBe(1);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].game).toBe(session.game);
    expect(next.history[0].tiles).toBe(session.tiles);
  });

  it("ignores invalid moves without changing history", () => {
    const grid = [
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const session = {
      ...createSession(),
      game: {
        ...createInitialState(),
        grid,
      },
      tiles: createTilesFromGrid(grid),
      freeUndosLeft: 3,
      rewardedUndosUsed: 0,
      moveCount: 0,
    };

    const next = applyMoveToSession(session, "left");

    expect(next).toBe(session);
  });

  it("restores the previous board on undo", () => {
    const previous = createInitialState();
    const session = {
      game: {
        ...createInitialState(),
        score: 12,
      },
      tiles: [],
      history: [{ game: previous, tiles: [] }],
      freeUndosLeft: 1,
      rewardedUndosUsed: 0,
      moveCount: 2,
    };

    const next = sessionReducer(session, { type: "UNDO" });

    expect(next.game).toBe(previous);
    expect(next.history).toHaveLength(0);
    expect(next.freeUndosLeft).toBe(0);
    expect(next.moveCount).toBe(1);
  });

  it("blocks undo when free undos are exhausted", () => {
    const previous = createInitialState();
    const session = {
      game: createInitialState(),
      tiles: [],
      history: [{ game: previous, tiles: [] }],
      freeUndosLeft: 0,
      rewardedUndosUsed: 0,
      moveCount: 1,
    };

    const next = sessionReducer(session, { type: "UNDO" });

    expect(next).toBe(session);
  });

  it("allows rewarded undo without consuming free undo credits", () => {
    const previous = createInitialState();
    const session = {
      game: { ...createInitialState(), score: 8 },
      tiles: [],
      history: [{ game: previous, tiles: [] }],
      freeUndosLeft: 0,
      rewardedUndosUsed: 0,
      moveCount: 3,
    };

    const next = sessionReducer(session, { type: "REWARDED_UNDO" });

    expect(next.game).toBe(previous);
    expect(next.freeUndosLeft).toBe(0);
    expect(next.rewardedUndosUsed).toBe(1);
    expect(next.moveCount).toBe(2);
  });

  it("blocks rewarded undo when cap is reached", () => {
    const previous = createInitialState();
    const session = {
      game: { ...createInitialState(), score: 8 },
      tiles: [],
      history: [{ game: previous, tiles: [] }],
      freeUndosLeft: 0,
      rewardedUndosUsed: 3,
      moveCount: 3,
    };

    const next = sessionReducer(session, { type: "REWARDED_UNDO" });

    expect(next).toBe(session);
  });

  it("clears history when starting a new game", () => {
    const session = {
      ...createSession(),
      history: [{ game: createInitialState(), tiles: [] }],
      freeUndosLeft: 2,
      rewardedUndosUsed: 1,
      moveCount: 1,
    };

    const next = sessionReducer(session, { type: "NEW_GAME" });

    expect(next.history).toHaveLength(0);
    expect(next.game.score).toBe(0);
    expect(next.game.best).toBe(session.game.best);
    expect(next.freeUndosLeft).toBe(3);
    expect(next.rewardedUndosUsed).toBe(0);
    expect(next.moveCount).toBe(0);
  });

  it("hydrates best score without lowering it", () => {
    const session = createSession(32);
    const next = sessionReducer(session, { type: "HYDRATE_BEST", best: 64 });

    expect(next.game.best).toBe(64);
  });

  it("restores a saved session", () => {
    const saved = createSession(100);
    const next = sessionReducer(createSession(), {
      type: "RESTORE",
      session: saved,
    });

    expect(next.game.best).toBe(100);
    expect(next.tiles).toEqual(saved.tiles);
  });
});
