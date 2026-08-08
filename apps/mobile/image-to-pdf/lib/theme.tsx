import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { loadExportSettings, saveExportSettings } from "./settings";
import type { AppearancePreference } from "./types";

const shared = {
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 10, md: 14, lg: 18, xl: 24, full: 999 },
  type: {
    hero: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5, lineHeight: 34 },
    title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
    body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
    bodyStrong: { fontSize: 16, fontWeight: "600" as const },
    caption: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
    overline: {
      fontSize: 11,
      fontWeight: "700" as const,
      letterSpacing: 0.9,
      textTransform: "uppercase" as const,
    },
  },
  minTouch: 48,
};

const darkColors = {
  bg: "#0B0D12",
  bgElevated: "#10131A",
  surface: "#151820",
  surfaceRaised: "#20242D",
  surfaceOverlay: "rgba(11, 13, 18, 0.92)",
  border: "#272B35",
  borderStrong: "#343946",
  text: "#F7F8FB",
  textSecondary: "#A8ADBA",
  textTertiary: "#777E8D",
  accent: "#6E61E9",
  accentBright: "#A9A2FF",
  accentMuted: "rgba(110, 97, 233, 0.16)",
  accentText: "#FFFFFF",
  success: "#57D6A2",
  successMuted: "rgba(87, 214, 162, 0.13)",
  danger: "#EF888C",
  dangerMuted: "rgba(239, 136, 140, 0.13)",
  warning: "#F4C96B",
  cameraChrome: "rgba(8, 9, 12, 0.64)",
};

const lightColors = {
  bg: "#F7F8FB",
  bgElevated: "#EEF0F5",
  surface: "#FFFFFF",
  surfaceRaised: "#F1F2F7",
  surfaceOverlay: "rgba(255, 255, 255, 0.94)",
  border: "#E1E4EB",
  borderStrong: "#D2D6E0",
  text: "#171923",
  textSecondary: "#5F6675",
  textTertiary: "#858C9B",
  accent: "#6658DE",
  accentBright: "#5B4FCC",
  accentMuted: "rgba(102, 88, 222, 0.10)",
  accentText: "#FFFFFF",
  success: "#178A61",
  successMuted: "rgba(23, 138, 97, 0.10)",
  danger: "#C94D54",
  dangerMuted: "rgba(201, 77, 84, 0.10)",
  warning: "#9A6B05",
  cameraChrome: "rgba(8, 9, 12, 0.64)",
};

export function createTheme(scheme: "light" | "dark") {
  const colors = scheme === "dark" ? darkColors : lightColors;
  return {
    ...shared,
    ...colors,
    scheme,
    isDark: scheme === "dark",
    shadow: {
      accent: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: scheme === "dark" ? 0.28 : 0.18,
        shadowRadius: 18,
        elevation: 7,
      },
      card: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: scheme === "dark" ? 0.22 : 0.08,
        shadowRadius: 15,
        elevation: scheme === "dark" ? 3 : 2,
      },
    },
  } as const;
}

export type AppTheme = ReturnType<typeof createTheme>;

type ThemeContextValue = {
  theme: AppTheme;
  appearance: AppearancePreference;
  resolvedScheme: "light" | "dark";
  setAppearance: (value: AppearancePreference) => Promise<void>;
};

const fallbackTheme = createTheme("dark");
const ThemeContext = createContext<ThemeContextValue>({
  theme: fallbackTheme,
  appearance: "system",
  resolvedScheme: "dark",
  setAppearance: async () => undefined,
});

function resolveScheme(
  appearance: AppearancePreference,
  systemScheme: ColorSchemeName,
): "light" | "dark" {
  if (appearance === "light" || appearance === "dark") return appearance;
  return systemScheme === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<AppearancePreference>("system");

  useEffect(() => {
    let active = true;
    void loadExportSettings().then((settings) => {
      if (active) setAppearanceState(settings.appearance ?? "system");
    });
    return () => {
      active = false;
    };
  }, []);

  const setAppearance = useCallback(async (value: AppearancePreference) => {
    setAppearanceState(value);
    const settings = await loadExportSettings();
    await saveExportSettings({ ...settings, appearance: value });
  }, []);

  const resolvedScheme = resolveScheme(appearance, systemScheme);
  const theme = useMemo(() => createTheme(resolvedScheme), [resolvedScheme]);
  const value = useMemo(
    () => ({ theme, appearance, resolvedScheme, setAppearance }),
    [theme, appearance, resolvedScheme, setAppearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
