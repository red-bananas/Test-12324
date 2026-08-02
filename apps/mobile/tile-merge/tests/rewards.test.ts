jest.mock("../game/ads/rewarded", () => ({
  initRewardedAds: jest.fn(),
  preloadRewardedAd: jest.fn(),
  showRewardedAd: jest.fn(),
  isExpoGoClient: jest.fn(() => false),
}));

import { isExpoGoClient, showRewardedAd } from "../game/ads/rewarded";
import { monetizationConfig } from "../game/monetization";
import { requestRewardedAction } from "../game/rewards";

const mockedShowRewardedAd = showRewardedAd as jest.MockedFunction<
  typeof showRewardedAd
>;
const mockedIsExpoGoClient = isExpoGoClient as jest.MockedFunction<
  typeof isExpoGoClient
>;

describe("rewarded actions", () => {
  beforeEach(() => {
    mockedShowRewardedAd.mockReset();
    mockedIsExpoGoClient.mockReturnValue(false);
  });

  it("grants undo when rewarded ad completes in phase 2", async () => {
    expect(monetizationConfig.phase).toBe(2);
    mockedShowRewardedAd.mockResolvedValue(true);
    await expect(requestRewardedAction("undo")).resolves.toBe(true);
    expect(mockedShowRewardedAd).toHaveBeenCalledTimes(1);
  });

  it("denies undo when rewarded ad is dismissed or unavailable", async () => {
    mockedShowRewardedAd.mockResolvedValue(false);
    await expect(requestRewardedAction("undo")).resolves.toBe(false);
  });

  it("grants undo in Expo Go without calling AdMob", async () => {
    mockedIsExpoGoClient.mockReturnValue(true);
    await expect(requestRewardedAction("undo")).resolves.toBe(true);
    expect(mockedShowRewardedAd).not.toHaveBeenCalled();
  });
});
