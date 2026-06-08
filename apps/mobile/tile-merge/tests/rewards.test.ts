import { monetizationConfig } from "../game/monetization";
import { requestRewardedAction } from "../game/rewards";

describe("rewarded actions", () => {
  it("grants undo rewards in phase 1 without an ad SDK", async () => {
    expect(monetizationConfig.phase).toBe(1);
    await expect(requestRewardedAction("undo")).resolves.toBe(true);
  });
});
