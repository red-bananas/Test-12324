import { Platform } from "react-native";

/** Sound assets ship in a follow-up; haptics cover merge feedback for now. */
export const soundEffectsAvailable = false;

export async function playMergeSound(_mergedValue: number, _enabled: boolean): Promise<void> {
  if (!soundEffectsAvailable || !_enabled || Platform.OS === "web") {
    return;
  }
}

export async function playMilestoneSound(_enabled: boolean): Promise<void> {
  if (!soundEffectsAvailable || !_enabled || Platform.OS === "web") {
    return;
  }
}
