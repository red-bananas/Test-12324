/** Phase 1 = free, no ads. Phase 2 turns on AdMob + rewarded flows. */
export const monetizationConfig = {
  phase: 1 as 1 | 2,
  freeUndosPerGame: 1,
  maxRewardedUndosPerGame: 3,
  interstitialEveryNGames: 3,
  removeAdsProductId: "REPLACE_REMOVE_ADS_PRODUCT_ID",
  /** Replace with your AdMob app ID before store. Dev uses test IDs via game/ads/rewarded.ts */
  admobAppId: "ca-app-pub-3940256099942544~3347511713",
  rewardedUndoUnitId: "ca-app-pub-3940256099942544/5224354917",
} as const;

export const DISPLAY_NAME = "Clone App";
export const STORE_LISTING_NAME = "Clone App";
export const PLAY_STORE_URL = "";
export const PRIVACY_POLICY_URL = "https://example.com/privacy";
export const SUPPORT_URL = "";
