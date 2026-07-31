import {
  getRewardedAdUnitId,
  GOOGLE_TEST_REWARDED_UNIT_ID,
  usesProductionAdUnits,
} from "../game/ads/rewarded";
import { monetizationConfig } from "../game/monetization";

describe("rewarded ad unit selection", () => {
  const originalEnv = process.env.EXPO_PUBLIC_USE_PRODUCTION_ADS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.EXPO_PUBLIC_USE_PRODUCTION_ADS;
    } else {
      process.env.EXPO_PUBLIC_USE_PRODUCTION_ADS = originalEnv;
    }
  });

  it("uses Google test unit by default (preview/QA)", () => {
    delete process.env.EXPO_PUBLIC_USE_PRODUCTION_ADS;
    expect(usesProductionAdUnits()).toBe(false);
    expect(getRewardedAdUnitId()).toBe(GOOGLE_TEST_REWARDED_UNIT_ID);
  });

  it("uses production unit only when EXPO_PUBLIC_USE_PRODUCTION_ADS=true", () => {
    process.env.EXPO_PUBLIC_USE_PRODUCTION_ADS = "true";
    expect(usesProductionAdUnits()).toBe(true);
    expect(getRewardedAdUnitId()).toBe(monetizationConfig.rewardedUndoUnitId);
  });
});
