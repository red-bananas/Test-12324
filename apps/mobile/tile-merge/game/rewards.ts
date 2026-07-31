import { showRewardedAd } from "./ads/rewarded";
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

  return showRewardedAd();
}
