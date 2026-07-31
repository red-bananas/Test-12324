import { monetizationConfig } from "../monetization";

/** Max opt-in rewarded undos per game — retention-safe cap. */
export function canUseRewardedUndo(rewardedUndosUsed: number): boolean {
  return rewardedUndosUsed < monetizationConfig.maxRewardedUndosPerGame;
}

export function remainingRewardedUndos(rewardedUndosUsed: number): number {
  return Math.max(
    0,
    monetizationConfig.maxRewardedUndosPerGame - rewardedUndosUsed,
  );
}
