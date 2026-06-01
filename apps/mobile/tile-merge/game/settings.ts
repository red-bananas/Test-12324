import AsyncStorage from "@react-native-async-storage/async-storage";

export const SETTINGS_KEY = "tile-merge-settings";
export const LAST_RUN_SCORE_KEY = "tile-merge-last-run-score";

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  confirmNewGame: boolean;
  onboardingSeen: boolean;
}

export const defaultSettings: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  reduceMotion: false,
  confirmNewGame: true,
  onboardingSeen: false,
};

export async function loadSettings(): Promise<GameSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return { ...defaultSettings };
    }
    const parsed = JSON.parse(stored) as Partial<GameSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings persistence failure must not break gameplay.
  }
}

export async function loadLastRunScore(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem(LAST_RUN_SCORE_KEY);
    if (!stored) {
      return 0;
    }
    const parsed = Number.parseInt(stored, 10);
    return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
  } catch {
    return 0;
  }
}

export async function saveLastRunScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_RUN_SCORE_KEY, String(Math.max(0, score)));
  } catch {
    // Non-critical persistence.
  }
}
