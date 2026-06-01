import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import {
  isHapticSupported,
  triggerInvalidMoveHaptic,
  triggerMergeHaptic,
} from "../game/haptics";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
  },
}));

describe("merge haptics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call native haptics on web", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });

    await triggerMergeHaptic(128);

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(isHapticSupported()).toBe(false);
  });

  it("uses light impact for small merges on ios", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });

    await triggerMergeHaptic(8, true);

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it("uses medium impact for large merges", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });

    await triggerMergeHaptic(256, true);

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it("uses success notification for milestone merges", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "android" });

    await triggerMergeHaptic(512, true);

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });

  it("respects disabled haptics setting", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });

    await triggerMergeHaptic(64, false);

    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it("triggers warning haptic on invalid moves", async () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });

    await triggerInvalidMoveHaptic(true);

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Warning,
    );
  });
});
