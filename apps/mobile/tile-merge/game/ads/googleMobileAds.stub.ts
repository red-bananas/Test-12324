/** Metro stub — Expo Go has no AdMob native binary. EAS / expo run:android use the real package. */

export const AdEventType = {
  CLOSED: "closed",
  ERROR: "error",
} as const;

export const RewardedAdEventType = {
  EARNED_REWARD: "earned_reward",
  LOADED: "loaded",
} as const;

class StubRewardedAd {
  static createForAdRequest(_unitId: string) {
    return new StubRewardedAd();
  }

  addAdEventListener(_event: string, _listener: () => void) {
    return () => undefined;
  }

  load() {}

  show() {}
}

export const RewardedAd = StubRewardedAd;

export default function mobileAds() {
  return {
    initialize: async () => undefined,
  };
}
