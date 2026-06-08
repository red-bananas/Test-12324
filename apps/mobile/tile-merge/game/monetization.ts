/** Phase 1 = free, no ads. Phase 2 turns on AdMob + rewarded flows. */
export const monetizationConfig = {
  phase: 1 as 1 | 2,
  freeUndosPerGame: 3,
  interstitialEveryNGames: 3,
  removeAdsProductId: "tile_merge_remove_ads",
} as const;

export const APP_VERSION = "1.0.0";

/** Host before Play Store submission — see PRIVACY.md in this app folder. */
export const PRIVACY_POLICY_URL =
  "https://github.com/tejas-veer/Auto-App/blob/main/apps/mobile/tile-merge/PRIVACY.md";

/** Optional tip link — empty hides the row in Settings. */
export const SUPPORT_URL = "";
