import { GRID_SIZE, type Direction, type Grid } from "./state";

export interface DisplayTile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  merged?: boolean;
}

let nextTileId = 1;

export function resetTileIds(start = 1): void {
  nextTileId = start;
}

export function syncTileIdCounter(tiles: DisplayTile[]): void {
  const maxId = tiles.reduce((max, tile) => Math.max(max, tile.id), 0);
  resetTileIds(maxId + 1);
}

export function hasDuplicateTileIds(tiles: DisplayTile[]): boolean {
  const seen = new Set<number>();
  return tiles.some((tile) => seen.has(tile.id) || !seen.add(tile.id));
}

export function reassignTileIds(tiles: DisplayTile[]): DisplayTile[] {
  let id = 1;
  return tiles.map((tile) => ({ ...tile, id: id++ }));
}

/** Repair corrupt saves and realign the module counter. */
export function ensureUniqueTileIds(tiles: DisplayTile[]): DisplayTile[] {
  const next = hasDuplicateTileIds(tiles) ? reassignTileIds(tiles) : tiles;
  syncTileIdCounter(next);
  return next;
}

export function createTilesFromGrid(grid: Grid): DisplayTile[] {
  const tiles: DisplayTile[] = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = grid[row][col];
      if (value > 0) {
        tiles.push({ id: nextTileId++, value, row, col });
      }
    }
  }
  return tiles;
}

function slideRowTiles(
  rowTiles: DisplayTile[],
  row: number,
): { tiles: DisplayTile[]; score: number; maxMerged: number; merged: boolean } {
  const sorted = [...rowTiles].sort((a, b) => a.col - b.col);
  const result: DisplayTile[] = [];
  let score = 0;
  let maxMerged = 0;
  let merged = false;
  let col = 0;

  for (let i = 0; i < sorted.length; ) {
    if (i + 1 < sorted.length && sorted[i].value === sorted[i + 1].value) {
      const value = sorted[i].value * 2;
      result.push({
        id: nextTileId++,
        value,
        row,
        col,
        merged: true,
      });
      score += value;
      maxMerged = Math.max(maxMerged, value);
      merged = true;
      i += 2;
    } else {
      result.push({ ...sorted[i], row, col });
      i += 1;
    }
    col += 1;
  }

  return { tiles: result, score, maxMerged, merged };
}

function moveTilesLeft(tiles: DisplayTile[]): {
  tiles: DisplayTile[];
  score: number;
  maxMerged: number;
  merged: boolean;
  moved: boolean;
} {
  let totalScore = 0;
  let maxMerged = 0;
  let merged = false;
  let moved = false;
  const next: DisplayTile[] = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    const rowTiles = tiles.filter((tile) => tile.row === row);
    const before = rowTiles.map((tile) => `${tile.col}:${tile.value}:${tile.id}`).join("|");
    const { tiles: rowResult, score, maxMerged: rowMax, merged: rowMerged } =
      slideRowTiles(rowTiles, row);
    const after = rowResult.map((tile) => `${tile.col}:${tile.value}:${tile.id}`).join("|");
    if (before !== after) {
      moved = true;
    }
    totalScore += score;
    maxMerged = Math.max(maxMerged, rowMax);
    merged = merged || rowMerged;
    next.push(...rowResult);
  }

  return { tiles: next, score: totalScore, maxMerged, merged, moved };
}

function transposeTiles(tiles: DisplayTile[]): DisplayTile[] {
  return tiles.map((tile) => ({ ...tile, row: tile.col, col: tile.row }));
}

function flipTilesHorizontal(tiles: DisplayTile[]): DisplayTile[] {
  return tiles.map((tile) => ({ ...tile, col: GRID_SIZE - 1 - tile.col }));
}

export function moveTiles(
  tiles: DisplayTile[],
  direction: Direction,
): {
  tiles: DisplayTile[];
  score: number;
  maxMerged: number;
  merged: boolean;
  moved: boolean;
} {
  if (direction === "left") {
    return moveTilesLeft(tiles);
  }

  if (direction === "right") {
    const flipped = flipTilesHorizontal(tiles);
    const result = moveTilesLeft(flipped);
    return {
      ...result,
      tiles: flipTilesHorizontal(result.tiles),
    };
  }

  if (direction === "up") {
    const transposed = transposeTiles(tiles);
    const result = moveTilesLeft(transposed);
    return {
      ...result,
      tiles: transposeTiles(result.tiles),
    };
  }

  if (direction === "down") {
    const transposed = transposeTiles(tiles);
    const flipped = flipTilesHorizontal(transposed);
    const result = moveTilesLeft(flipped);
    const unflipped = flipTilesHorizontal(result.tiles);
    return {
      ...result,
      tiles: transposeTiles(unflipped),
    };
  }

  return moveTilesLeft(tiles);
}

export function addSpawnedTile(
  tiles: DisplayTile[],
  spawn: { row: number; col: number; value: number },
): DisplayTile[] {
  return [
    ...tiles,
    {
      id: nextTileId++,
      value: spawn.value,
      row: spawn.row,
      col: spawn.col,
      isNew: true,
    },
  ];
}

export function gridFromTiles(tiles: DisplayTile[]): Grid {
  const grid: Grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0),
  );
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile.value;
  }
  return grid;
}

export function highestTileValue(tiles: DisplayTile[]): number {
  return tiles.reduce((max, tile) => Math.max(max, tile.value), 0);
}
