import { gameReducer, initialGameState } from "../game/state";

describe("game logic", () => {
  it("increments score on tick", () => {
    const next = gameReducer(initialGameState, { type: "tick" });
    expect(next.score).toBe(1);
  });
});
