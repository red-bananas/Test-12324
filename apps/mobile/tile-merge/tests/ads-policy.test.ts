import {
  canUseRewardedUndo,
  remainingRewardedUndos,
} from "../game/ads/policy";
import { monetizationConfig } from "../game/monetization";

describe("ad policy", () => {
  it("allows rewarded undos up to the per-game cap", () => {
    expect(canUseRewardedUndo(0)).toBe(true);
    expect(canUseRewardedUndo(2)).toBe(true);
    expect(canUseRewardedUndo(monetizationConfig.maxRewardedUndosPerGame)).toBe(
      false,
    );
  });

  it("reports remaining rewarded undos", () => {
    expect(remainingRewardedUndos(0)).toBe(3);
    expect(remainingRewardedUndos(1)).toBe(2);
    expect(remainingRewardedUndos(3)).toBe(0);
  });
});
