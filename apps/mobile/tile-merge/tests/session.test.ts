import {
  applyMove,
  createInitialState,
} from "../game/state";
import { addSpawnedTile, createTilesFromGrid, moveTiles } from "../game/tiles";
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

  let nextTiles = moveTiles(session.tiles, direction).tiles.map((tile) => ({
    ...tile,
    isNew: false,
    merged: tile.merged ?? false,
  }));
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
    };

    const next = applyMoveToSession(session, "left", () => 0.1);

    expect(next.game.score).toBe(4);
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
    };

    const next = sessionReducer(session, { type: "UNDO" });

    expect(next.game).toBe(previous);
    expect(next.history).toHaveLength(0);
  });

  it("clears history when starting a new game", () => {
    const session = {
      ...createSession(),
      history: [{ game: createInitialState(), tiles: [] }],
    };

    const next = sessionReducer(session, { type: "NEW_GAME" });

    expect(next.history).toHaveLength(0);
    expect(next.game.score).toBe(0);
    expect(next.game.best).toBe(session.game.best);
  });

  it("hydrates best score without lowering it", () => {
    const session = createSession(32);
    const next = sessionReducer(session, { type: "HYDRATE_BEST", best: 64 });

    expect(next.game.best).toBe(64);
  });
});
