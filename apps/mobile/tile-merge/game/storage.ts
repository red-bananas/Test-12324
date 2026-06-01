import AsyncStorage from "@react-native-async-storage/async-storage";

export const BEST_SCORE_KEY = "tile-merge-best-score";

export async function loadBestScore(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(BEST_SCORE_KEY);
    if (!stored) {
      return 0;
    }
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
  } catch {
    return 0;
  }
}

export async function saveBestScore(best: number): Promise<void> {
  try {
    await AsyncStorage.setItem(BEST_SCORE_KEY, String(Math.max(0, best)));
  } catch {
    // Persistence failure must not break gameplay.
  }
}
