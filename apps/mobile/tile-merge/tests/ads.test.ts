import {
  getRewardedAdUnitId,
  GOOGLE_TEST_REWARDED_UNIT_ID,
  isNativeAdsSupported,
  usesProductionAdUnits,
} from "../game/ads/rewarded";
import { monetizationConfig } from "../game/monetization";

jest.mock("expo-constants", () => ({
  executionEnvironment: "standalone",
  appOwnership: null,
}));

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

  it("disables native ads in Expo Go", () => {
    jest.resetModules();
    jest.doMock("expo-constants", () => ({
      executionEnvironment: "storeClient",
      appOwnership: "expo",
    }));
    const { isNativeAdsSupported: isSupportedInGo } = require("../game/ads/rewarded");
    expect(isSupportedInGo()).toBe(false);
  });
});
