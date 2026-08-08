import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ExportSettings } from "./types";

const STORAGE_KEY = "image-to-pdf:settings";

export const defaultExportSettings: ExportSettings = {
  paperSize: "A4",
  jpegQuality: 0.85,
  appearance: "system",
};

export async function loadExportSettings(): Promise<ExportSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultExportSettings;
    const parsed = JSON.parse(raw) as Partial<ExportSettings>;
    const appearance =
      parsed.appearance === "light" || parsed.appearance === "dark"
        ? parsed.appearance
        : "system";
    return {
      paperSize: parsed.paperSize === "LETTER" ? "LETTER" : "A4",
      jpegQuality:
        typeof parsed.jpegQuality === "number"
          ? Math.min(1, Math.max(0.5, parsed.jpegQuality))
          : defaultExportSettings.jpegQuality,
      appearance,
    };
  } catch {
    return defaultExportSettings;
  }
}

export async function saveExportSettings(settings: ExportSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
