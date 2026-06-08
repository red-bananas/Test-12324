import { monetizationConfig } from "./monetization";

export type RewardKind = "undo";

/**
 * Player-positive rewarded action. Phase 1: instant grant (no SDK).
 * Phase 2: show AdMob rewarded video; resolve false if unavailable.
 */
export async function requestRewardedAction(
  _kind: RewardKind,
): Promise<boolean> {
  if (monetizationConfig.phase === 1) {
    return true;
  }

  // TODO(phase-2): integrate expo-ads-admob rewarded unit; fallback false offline.
  return false;
}
