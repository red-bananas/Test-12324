import { createInitialState } from "../game/state";

describe("tile merge smoke", () => {
  it("creates a playable initial board", () => {
    const game = createInitialState();
    expect(game.grid.flat().filter((value) => value > 0)).toHaveLength(2);
    expect(game.status).toBe("playing");
  });
});
