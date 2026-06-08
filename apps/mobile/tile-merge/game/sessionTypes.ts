import type { GameState } from "./state";
import type { DisplayTile } from "./tiles";

export interface SessionSnapshot {
  game: GameState;
  tiles: DisplayTile[];
}

export interface GameSession extends SessionSnapshot {
  history: SessionSnapshot[];
  freeUndosLeft: number;
  moveCount: number;
}
