export type Direction = "up" | "down" | "left" | "right";
export type Grid = number[][];
export type GameStatus = "playing" | "won" | "lost";

export const GRID_SIZE = 4;
export const WIN_TILE = 2048;

export interface GameState {
  grid: Grid;
  score: number;
  best: number;
  status: GameStatus;
  wonAcknowledged: boolean;
}

export interface MoveResult {
  state: GameState;
  moved: boolean;
  merged: boolean;
  pointsGained: number;
  maxTileMerged: number;
  spawn: { row: number; col: number; value: number } | null;
}

function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function slideRow(row: number[]): { row: number[]; score: number; maxMerged: number } {
  const filtered = row.filter((value) => value !== 0);
  const merged: number[] = [];
  let score = 0;
  let maxMerged = 0;

  for (let i = 0; i < filtered.length; i += 1) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      score += value;
      maxMerged = Math.max(maxMerged, value);
      i += 1;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < GRID_SIZE) {
    merged.push(0);
  }

  return { row: merged, score, maxMerged };
}

function transpose(grid: Grid): Grid {
  return Array.from({ length: GRID_SIZE }, (_, column) =>
    Array.from({ length: GRID_SIZE }, (_, row) => grid[row][column]),
  );
}

function moveLeft(grid: Grid): {
  grid: Grid;
  score: number;
  maxMerged: number;
  moved: boolean;
} {
  let totalScore = 0;
  let maxMerged = 0;
  let moved = false;
  const next = grid.map((row) => {
    const before = [...row];
    const { row: mergedRow, score, maxMerged: rowMax } = slideRow(row);
    totalScore += score;
    maxMerged = Math.max(maxMerged, rowMax);
    if (!before.every((value, index) => value === mergedRow[index])) {
      moved = true;
    }
    return mergedRow;
  });
  return { grid: next, score: totalScore, maxMerged, moved };
}

export function moveGrid(
  grid: Grid,
  direction: Direction,
): { grid: Grid; score: number; maxMerged: number; moved: boolean } {
  if (direction === "left") {
    return moveLeft(grid);
  }

  if (direction === "right") {
    const flipped = grid.map((row) => [...row].reverse());
    const result = moveLeft(flipped);
    return {
      grid: result.grid.map((row) => [...row].reverse()),
      score: result.score,
      maxMerged: result.maxMerged,
      moved: result.moved,
    };
  }

  if (direction === "up") {
    const transposed = transpose(grid);
    const result = moveLeft(transposed);
    return {
      grid: transpose(result.grid),
      score: result.score,
      maxMerged: result.maxMerged,
      moved: result.moved,
    };
  }

  const transposed = transpose(grid).map((row) => [...row].reverse());
  const result = moveLeft(transposed);
  const restored = result.grid.map((row) => [...row].reverse());
  return {
    grid: transpose(restored),
    score: result.score,
    maxMerged: result.maxMerged,
    moved: result.moved,
  };
}

export function spawnTile(grid: Grid, random = Math.random): Grid {
  return spawnTileWithMeta(grid, random).grid;
}

export function spawnTileWithMeta(
  grid: Grid,
  random = Math.random,
): {
  grid: Grid;
  spawn: { row: number; col: number; value: number } | null;
} {
  const emptyCells: Array<[number, number]> = [];
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      if (grid[r][c] === 0) {
        emptyCells.push([r, c]);
      }
    }
  }

  if (emptyCells.length === 0) {
    return { grid, spawn: null };
  }

  const index = Math.floor(random() * emptyCells.length);
  const [row, col] = emptyCells[index];
  const value = random() < 0.9 ? 2 : 4;
  const next = cloneGrid(grid);
  next[row][col] = value;
  return { grid: next, spawn: { row, col, value } };
}

export function hasMoves(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r += 1) {
    for (let c = 0; c < GRID_SIZE; c += 1) {
      const value = grid[r][c];
      if (value === 0) {
        return true;
      }
      if (c + 1 < GRID_SIZE && grid[r][c + 1] === value) {
        return true;
      }
      if (r + 1 < GRID_SIZE && grid[r + 1][c] === value) {
        return true;
      }
    }
  }
  return false;
}

export function hasWinTile(grid: Grid, target = WIN_TILE): boolean {
  return grid.some((row) => row.some((value) => value >= target));
}

export function createInitialState(best = 0, random = Math.random): GameState {
  let grid = emptyGrid();
  grid = spawnTile(grid, random);
  grid = spawnTile(grid, random);
  return {
    grid,
    score: 0,
    best,
    status: "playing",
    wonAcknowledged: false,
  };
}

export function applyMove(
  state: GameState,
  direction: Direction,
  random = Math.random,
): MoveResult {
  if (state.status === "lost") {
    return {
      state,
      moved: false,
      merged: false,
      pointsGained: 0,
      maxTileMerged: 0,
      spawn: null,
    };
  }

  const { grid, score, maxMerged, moved } = moveGrid(state.grid, direction);
  if (!moved) {
    return {
      state,
      moved: false,
      merged: false,
      pointsGained: 0,
      maxTileMerged: 0,
      spawn: null,
    };
  }

  const { grid: nextGrid, spawn } = spawnTileWithMeta(grid, random);
  const nextScore = state.score + score;
  const nextBest = Math.max(state.best, nextScore);

  let status: GameStatus = state.status;
  let wonAcknowledged = state.wonAcknowledged;

  if (!wonAcknowledged && hasWinTile(nextGrid)) {
    status = "won";
  } else if (!hasMoves(nextGrid)) {
    status = "lost";
  } else if (state.status === "won" && wonAcknowledged) {
    status = "playing";
  }

  return {
    moved: true,
    merged: score > 0,
    pointsGained: score,
    maxTileMerged: maxMerged,
    spawn,
    state: {
      grid: nextGrid,
      score: nextScore,
      best: nextBest,
      status,
      wonAcknowledged,
    },
  };
}

export function continueAfterWin(state: GameState): GameState {
  if (state.status !== "won") {
    return state;
  }
  return {
    ...state,
    status: hasMoves(state.grid) ? "playing" : "lost",
    wonAcknowledged: true,
  };
}

export function resetGame(best: number, random = Math.random): GameState {
  return createInitialState(best, random);
}

export function serializeGrid(grid: Grid): string {
  return grid.map((row) => row.join(",")).join(";");
}

export function deserializeGrid(serialized: string): Grid {
  return serialized.split(";").map((row) => row.split(",").map(Number));
}
