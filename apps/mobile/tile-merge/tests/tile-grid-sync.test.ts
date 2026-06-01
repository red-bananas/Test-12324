import { createInitialState } from "../game/state";
import { moveGrid, spawnTileWithMeta } from "../game/state";
import {
  addSpawnedTile,
  createTilesFromGrid,
  gridFromTiles,
  moveTiles,
  resetTileIds,
} from "../game/tiles";

describe("tile/grid sync", () => {
  beforeEach(() => {
    resetTileIds();
  });

  it("tile engine matches grid engine across random moves", () => {
    let state = createInitialState(0, () => 0.42);
    let tiles = createTilesFromGrid(state.grid);
    const directions = ["left", "right", "up", "down"] as const;

    for (let i = 0; i < 40; i += 1) {
      const direction = directions[i % directions.length];
      const gridResult = moveGrid(state.grid, direction);
      const tileResult = moveTiles(tiles, direction);

      if (tileResult.moved !== gridResult.moved) {
        throw new Error(
          `desync at move ${i} ${direction}: grid moved=${gridResult.moved} tiles moved=${tileResult.moved}`,
        );
      }

      expect(tileResult.moved).toBe(gridResult.moved);
      if (!gridResult.moved) {
        continue;
      }

      expect(gridFromTiles(tileResult.tiles)).toEqual(gridResult.grid);

      const spawned = spawnTileWithMeta(gridResult.grid, () => 0.1);
      state = { ...state, grid: spawned.grid };
      tiles = tileResult.tiles;
      if (spawned.spawn) {
        tiles = addSpawnedTile(tiles, spawned.spawn);
      }

      expect(gridFromTiles(tiles)).toEqual(state.grid);
    }
  });
});
