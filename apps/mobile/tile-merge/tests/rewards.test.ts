jest.mock("../game/ads/rewarded", () => ({
  initRewardedAds: jest.fn(),
  preloadRewardedAd: jest.fn(),
  showRewardedAd: jest.fn(),
}));

import { showRewardedAd } from "../game/ads/rewarded";
import { monetizationConfig } from "../game/monetization";
import { requestRewardedAction } from "../game/rewards";

const mockedShowRewardedAd = showRewardedAd as jest.MockedFunction<
  typeof showRewardedAd
>;

describe("rewarded actions", () => {
  beforeEach(() => {
    mockedShowRewardedAd.mockReset();
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
});
