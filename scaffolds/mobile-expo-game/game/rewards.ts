import { showRewardedAd } from "./ads/rewarded";
import { monetizationConfig } from "./monetization";

/** Phase 1: instant grant. Phase 2: show rewarded video. */
export async function grantRewardedBonus(): Promise<boolean> {
  if (monetizationConfig.phase === 1) {
    return true;
  }
  return showRewardedAd();
}
