import {
  addSpawnedTile,
  createTilesFromGrid,
  ensureUniqueTileIds,
  hasDuplicateTileIds,
  moveTiles,
  resetTileIds,
  syncTileIdCounter,
} from "../game/tiles";

describe("tile animation model", () => {
  beforeEach(() => {
    resetTileIds();
  });

  it("creates stable tile ids from a grid", () => {
    const tiles = createTilesFromGrid([
      [2, 0, 0, 0],
      [0, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    expect(tiles).toHaveLength(2);
    expect(tiles[0].id).toBe(1);
    expect(tiles[1].id).toBe(2);
  });

  it("marks merged tiles when combining values", () => {
    const tiles = createTilesFromGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const moved = moveTiles(tiles, "left");

    expect(moved.merged).toBe(true);
    expect(moved.tiles).toHaveLength(1);
    expect(moved.tiles[0].value).toBe(4);
    expect(moved.tiles[0].merged).toBe(true);
  });

  it("adds a spawned tile with isNew flag", () => {
    const tiles = createTilesFromGrid([
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const next = addSpawnedTile(tiles, { row: 1, col: 2, value: 2 });

    expect(next).toHaveLength(2);
    expect(next[1].isNew).toBe(true);
    expect(next[1].row).toBe(1);
  });

  it("reassigns duplicate tile ids from corrupt state", () => {
    const corrupt = [
      { id: 4, value: 2, row: 0, col: 0 },
      { id: 4, value: 8, row: 1, col: 1 },
      { id: 15, value: 16, row: 2, col: 2 },
    ];
    const fixed = ensureUniqueTileIds(corrupt);
    const ids = fixed.map((tile) => tile.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(hasDuplicateTileIds(fixed)).toBe(false);
  });

  it("keeps ids unique after merge when counter was reset", () => {
    const tiles = createTilesFromGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 8, 8],
    ]);
    resetTileIds(1);
    syncTileIdCounter(tiles);
    const moved = moveTiles(tiles, "left");
    const ids = moved.tiles.map((tile) => tile.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
