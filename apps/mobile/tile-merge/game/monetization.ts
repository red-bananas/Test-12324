/** Phase 1 = free, no ads. Phase 2 turns on AdMob + rewarded flows. */
export const monetizationConfig = {
  phase: 2 as 1 | 2,
  freeUndosPerGame: 1,
  maxResumeUndosOnGameOver: 3, // moves restored per game-over ad (one ad)
  interstitialEveryNGames: 3,
  removeAdsProductId: "tile_merge_remove_ads",
  admobAppId: "ca-app-pub-8557764165565608~1296387874",
  /** Production only — dev/preview use Google test IDs (see game/ads/rewarded.ts). */
  rewardedUndoUnitId: "ca-app-pub-8557764165565608/6357142860",
} as const;

/** In-app brand (matches Play Store listing). */
export const DISPLAY_NAME = "Merge Tiles";
export const STORE_LISTING_NAME = "Merge Tiles: Offline Puzzle";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.autoapp.tilemerge";

export const APP_VERSION = "1.1.0";

/** Public privacy policy — GitHub Pages (Play Console requires stable HTML URL). */
export const PRIVACY_POLICY_URL =
  "https://tejas-veer.github.io/Auto-App/privacy/tile-merge.html";

/** Optional tip link — empty hides the row in Settings. */
export const SUPPORT_URL = "";
