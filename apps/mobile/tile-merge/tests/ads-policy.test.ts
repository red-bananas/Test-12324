import { canUseRewardedUndo } from "../game/ads/policy";

describe("ad policy", () => {
  it("allows unlimited rewarded undos", () => {
    expect(canUseRewardedUndo()).toBe(true);
  });
});
