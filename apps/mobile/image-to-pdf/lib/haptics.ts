import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export async function triggerSuccessHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore missing native module.
  }
}

export async function triggerTapHaptic(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ignore.
  }
}
