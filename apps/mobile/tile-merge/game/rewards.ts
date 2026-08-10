import { isExpoGoClient, showRewardedAd } from "./ads/rewarded";
import { monetizationConfig } from "./monetization";

export type RewardKind = "undo";

/**
 * Player-positive rewarded action. Phase 1: instant grant (no SDK).
 * Phase 2: show AdMob rewarded video; resolve false if unavailable.
 * Expo Go: instant grant (no native AdMob) so undo UX is testable locally.
 */
export async function requestRewardedAction(
  _kind: RewardKind,
): Promise<boolean> {
  if (monetizationConfig.phase === 1) {
    return true;
  }

  if (isExpoGoClient()) {
    return true;
  }

  return showRewardedAd();
}
