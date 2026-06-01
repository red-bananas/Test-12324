import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Safe on web, simulators, and devices without haptic hardware. */
export async function triggerMergeHaptic(
  mergedValue = 2,
  enabled = true,
): Promise<void> {
  if (!enabled || Platform.OS === "web") {
    return;
  }

  try {
    if (mergedValue >= 512) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (mergedValue >= 128) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Native module missing or unsupported — gameplay must continue.
  }
}

export async function triggerInvalidMoveHaptic(enabled = true): Promise<void> {
  if (!enabled || Platform.OS === "web") {
    return;
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Ignore haptic failures.
  }
}

export function isHapticSupported(): boolean {
  return Platform.OS !== "web";
}
