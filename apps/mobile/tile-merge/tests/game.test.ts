import {
  applyMove,
  createInitialState,
  hasMoves,
  moveGrid,
  resetGame,
  spawnTile,
  WIN_TILE,
} from "../game/state";

describe("tile merge game logic", () => {
  it("merges identical tiles when sliding left", () => {
    const grid = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveGrid(grid, "left");
    expect(result.grid[0]).toEqual([4, 0, 0, 0]);
    expect(result.score).toBe(4);
    expect(result.moved).toBe(true);
  });

  it("adds score from multiple merges in one move", () => {
    const grid = [
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveGrid(grid, "left");
    expect(result.grid[0]).toEqual([4, 8, 0, 0]);
    expect(result.score).toBe(12);
  });

  it("does not merge the same row twice in one move", () => {
    const grid = [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    const result = moveGrid(grid, "left");
    expect(result.grid[0]).toEqual([4, 2, 0, 0]);
  });

  it("increments score and spawns a tile after a valid move", () => {
    const state = {
      ...createInitialState(),
      grid: [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };

    const result = applyMove(state, "left", () => 0.1);
    expect(result.moved).toBe(true);
    expect(result.state.score).toBe(4);
    expect(result.state.grid.flat().filter(Boolean).length).toBe(2);
  });

  it("detects game over when no moves remain", () => {
    const grid = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];

    expect(hasMoves(grid)).toBe(false);
  });

  it("marks win when the target tile appears", () => {
    const state = {
      ...createInitialState(),
      grid: [
        [1024, 1024, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };

    const result = applyMove(state, "left", () => 0.99);
    expect(result.state.status).toBe("won");
    expect(result.state.grid[0][0]).toBe(WIN_TILE);
  });

  it("preserves best score on reset", () => {
    const next = resetGame(128);
    expect(next.best).toBe(128);
    expect(next.score).toBe(0);
    expect(next.status).toBe("playing");
  });

  it("spawns only on empty cells", () => {
    const fullExceptOne = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 0],
    ];

    const next = spawnTile(fullExceptOne, () => 0);
    expect(next[3][3]).toBe(2);
  });

  it("moves correctly in all four directions", () => {
    const horizontal = [
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    expect(moveGrid(horizontal, "left").grid[0]).toEqual([2, 0, 0, 0]);
    expect(moveGrid(horizontal, "right").grid[0]).toEqual([0, 0, 0, 2]);

    const verticalUp = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 2],
    ];

    expect(moveGrid(verticalUp, "up").grid[0]).toEqual([0, 0, 0, 2]);

    const verticalDown = [
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    expect(moveGrid(verticalDown, "down").grid[3]).toEqual([0, 0, 0, 2]);
  });
});
