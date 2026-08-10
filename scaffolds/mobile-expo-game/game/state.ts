export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  score: number;
  status: GameStatus;
};

export const initialGameState: GameState = {
  score: 0,
  status: "playing",
};

export function gameReducer(
  state: GameState,
  action: { type: "tick" },
): GameState {
  if (action.type === "tick") {
    return { ...state, score: state.score + 1 };
  }
  return state;
}
