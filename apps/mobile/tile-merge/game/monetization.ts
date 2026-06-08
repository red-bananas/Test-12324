/** Phase 1 = free, no ads. Phase 2 turns on AdMob + rewarded flows. */
export const monetizationConfig = {
  phase: 1 as 1 | 2,
  freeUndosPerGame: 3,
  interstitialEveryNGames: 3,
  removeAdsProductId: "tile_merge_remove_ads",
} as const;

export const APP_VERSION = "1.0.0";

/** Public privacy policy — GitHub Pages (Play Console requires stable HTML URL). */
export const PRIVACY_POLICY_URL =
  "https://tejas-veer.github.io/Auto-App/privacy/tile-merge.html";

/** Optional tip link — empty hides the row in Settings. */
export const SUPPORT_URL = "";
