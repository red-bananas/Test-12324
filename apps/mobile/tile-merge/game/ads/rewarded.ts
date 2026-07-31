import { Platform } from "react-native";
import { monetizationConfig } from "../monetization";

/** Google sample rewarded unit — safe to click during dev/QA. */
export const GOOGLE_TEST_REWARDED_UNIT_ID =
  "ca-app-pub-3940256099942544/5224354917";

let initialized = false;

export function usesProductionAdUnits(): boolean {
  return process.env.EXPO_PUBLIC_USE_PRODUCTION_ADS === "true";
}

/** Production unit only when EXPO_PUBLIC_USE_PRODUCTION_ADS=true (EAS production). */
export function getRewardedAdUnitId(): string {
  if (!usesProductionAdUnits()) {
    return GOOGLE_TEST_REWARDED_UNIT_ID;
  }
  return monetizationConfig.rewardedUndoUnitId;
}

function isNativeAdsSupported(): boolean {
  return (
    monetizationConfig.phase === 2 &&
    (Platform.OS === "android" || Platform.OS === "ios")
  );
}

export async function initRewardedAds(): Promise<void> {
  if (!isNativeAdsSupported() || initialized) {
    return;
  }

  try {
    const mobileAds = (await import("react-native-google-mobile-ads")).default;
    await mobileAds().initialize();
    initialized = true;
  } catch {
    // Expo Go, web, Jest — no native AdMob module.
  }
}

export async function preloadRewardedAd(): Promise<void> {
  if (!isNativeAdsSupported()) {
    return;
  }

  try {
    const { RewardedAd } = await import("react-native-google-mobile-ads");
    const ad = RewardedAd.createForAdRequest(getRewardedAdUnitId());
    ad.load();
  } catch {
    // Preload is best-effort; showRewardedAd loads on demand.
  }
}

/**
 * Show a rewarded video. Resolves true only when the user earns the reward.
 * Uses Google test ad units unless EXPO_PUBLIC_USE_PRODUCTION_ADS=true.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!isNativeAdsSupported()) {
    return false;
  }

  try {
    const { RewardedAd, RewardedAdEventType, AdEventType } = await import(
      "react-native-google-mobile-ads"
    );

    return await new Promise<boolean>((resolve) => {
      let earned = false;
      let settled = false;
      const unsubscribers: Array<() => void> = [];

      const finish = (value: boolean) => {
        if (settled) {
          return;
        }
        settled = true;
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        resolve(value);
      };

      const rewarded = RewardedAd.createForAdRequest(getRewardedAdUnitId());

      unsubscribers.push(
        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
      );

      unsubscribers.push(
        rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          finish(earned);
        }),
      );

      unsubscribers.push(
        rewarded.addAdEventListener(AdEventType.ERROR, () => {
          finish(false);
        }),
      );

      unsubscribers.push(
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          try {
            void rewarded.show();
          } catch {
            finish(false);
          }
        }),
      );

      rewarded.load();
    });
  } catch {
    return false;
  }
}
