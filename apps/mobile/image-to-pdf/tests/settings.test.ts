import AsyncStorage from "@react-native-async-storage/async-storage";
import { createTheme } from "../lib/theme";
import {
  defaultExportSettings,
  loadExportSettings,
  saveExportSettings,
} from "../lib/settings";

const STORAGE_KEY = "image-to-pdf:settings";

describe("settings", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("defaults to the system appearance", async () => {
    await expect(loadExportSettings()).resolves.toEqual(defaultExportSettings);
    expect(defaultExportSettings.appearance).toBe("system");
  });

  it("migrates settings saved before appearance support", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ paperSize: "LETTER", jpegQuality: 0.7 }),
    );

    await expect(loadExportSettings()).resolves.toEqual({
      paperSize: "LETTER",
      jpegQuality: 0.7,
      appearance: "system",
    });
  });

  it("persists an explicit appearance", async () => {
    await saveExportSettings({
      paperSize: "A4",
      jpegQuality: 0.85,
      appearance: "dark",
    });

    expect((await loadExportSettings()).appearance).toBe("dark");
  });
});

describe("theme palettes", () => {
  it("provides distinct readable light and dark surfaces", () => {
    const light = createTheme("light");
    const dark = createTheme("dark");

    expect(light.bg).not.toBe(dark.bg);
    expect(light.text).not.toBe(dark.text);
    expect(light.isDark).toBe(false);
    expect(dark.isDark).toBe(true);
  });
});
