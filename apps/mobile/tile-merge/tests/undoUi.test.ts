import { gameOverResumeMoveCount, resolveUndoButtonState } from "../game/undoUi";

describe("undo UI state", () => {
  it("shows disabled undo with count on a new game", () => {
    expect(
      resolveUndoButtonState({
        hasHistory: false,
        freeUndosLeft: 1,
        gameStatus: "playing",
        resumeUndosRemaining: 0,
      }),
    ).toEqual({ mode: "free", freeLeft: 1, enabled: false });
  });

  it("enables undo after the first move", () => {
    expect(
      resolveUndoButtonState({
        hasHistory: true,
        freeUndosLeft: 1,
        gameStatus: "playing",
        resumeUndosRemaining: 0,
      }),
    ).toEqual({ mode: "free", freeLeft: 1, enabled: true });
  });

  it("switches to watch-ad undo after the free credit is used", () => {
    expect(
      resolveUndoButtonState({
        hasHistory: true,
        freeUndosLeft: 0,
        gameStatus: "playing",
        resumeUndosRemaining: 0,
      }),
    ).toEqual({ mode: "watchAd", freeLeft: 0, enabled: true });
  });

  it("keeps watch-ad undo disabled until the next move", () => {
    expect(
      resolveUndoButtonState({
        hasHistory: false,
        freeUndosLeft: 0,
        gameStatus: "playing",
        resumeUndosRemaining: 0,
      }),
    ).toEqual({ mode: "watchAd", freeLeft: 0, enabled: false });
  });

  it("disables header undo on game over without resume count", () => {
    expect(
      resolveUndoButtonState({
        hasHistory: true,
        freeUndosLeft: 0,
        gameStatus: "lost",
        resumeUndosRemaining: 3,
      }),
    ).toEqual({ mode: "watchAd", freeLeft: 0, enabled: false });
  });

  it("keeps header undo disabled on game over even with free credit left", () => {
    expect(
      resolveUndoButtonState({
        hasHistory: true,
        freeUndosLeft: 1,
        gameStatus: "lost",
        resumeUndosRemaining: 3,
      }),
    ).toEqual({ mode: "free", freeLeft: 1, enabled: false });
  });
});

describe("game over resume moves", () => {
  it("returns batch move count before resume ad is used", () => {
    expect(gameOverResumeMoveCount(false, 5, 3)).toBe(3);
    expect(gameOverResumeMoveCount(false, 2, 3)).toBe(2);
  });

  it("returns zero after resume ad is used", () => {
    expect(gameOverResumeMoveCount(true, 5, 3)).toBe(0);
    expect(gameOverResumeMoveCount(false, 0, 3)).toBe(0);
  });
});
