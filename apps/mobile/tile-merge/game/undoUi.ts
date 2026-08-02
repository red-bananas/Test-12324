export type UndoButtonMode = "free" | "watchAd";

export interface UndoButtonState {
  mode: UndoButtonMode;
  /** Shown on the badge while in free mode (including disabled new-game state). */
  freeLeft: number;
  /** False when there is no move to undo, or undo is not allowed. */
  enabled: boolean;
  /** Optional badge on watch-ad mode (e.g. resume undos left on game over). */
  watchAdBadge?: number;
}

/**
 * Undo button states:
 * - free + badge: default and new game (disabled until first move)
 * - watchAd: after free credit used during play
 */
export function resolveUndoButtonState(input: {
  hasHistory: boolean;
  freeUndosLeft: number;
  gameStatus: "playing" | "won" | "lost";
  resumeUndosRemaining: number;
}): UndoButtonState {
  if (input.gameStatus === "lost" || input.gameStatus === "won") {
    return {
      mode: input.freeUndosLeft > 0 ? "free" : "watchAd",
      freeLeft: input.freeUndosLeft,
      enabled: false,
    };
  }

  if (input.freeUndosLeft > 0) {
    return {
      mode: "free",
      freeLeft: input.freeUndosLeft,
      enabled: input.hasHistory,
    };
  }

  if (input.gameStatus === "playing" && input.hasHistory) {
    return {
      mode: "watchAd",
      freeLeft: 0,
      enabled: true,
    };
  }

  return {
    mode: "watchAd",
    freeLeft: 0,
    enabled: false,
  };
}

/** Moves restored by one game-over ad (0 if already used or no history). */
export function gameOverResumeMoveCount(
  resumeUsed: boolean,
  historyLength: number,
  maxMoves: number,
): number {
  if (resumeUsed || historyLength === 0) {
    return 0;
  }
  return Math.min(historyLength, maxMoves);
}
