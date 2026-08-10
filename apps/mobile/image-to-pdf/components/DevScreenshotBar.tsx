import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../lib/theme";

type Shot = {
  id: string;
  label: string;
  route: string;
};

const SHOTS: Shot[] = [
  { id: "hub", label: "Hub", route: "/?screenshot=1" },
  { id: "editor", label: "Editor", route: "/editor?screenshot=1" },
  { id: "crop", label: "Crop", route: "/crop?index=0&screenshot=1" },
  { id: "success", label: "Done", route: "/success?screenshot=1" },
];

export function DevScreenshotBar() {
  const router = useRouter();
  const { theme } = useAppTheme();

  if (!__DEV__) return null;

  return (
    <View
      style={[styles.bar, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
      accessibilityLabel="Screenshot capture navigation"
      testID="screenshot-dev-bar"
    >
      <Text style={[styles.title, { color: theme.textSecondary }]}>Store shots</Text>
      <View style={styles.row}>
        {SHOTS.map((shot) => (
          <Pressable
            key={shot.id}
            testID={`screenshot-dev-${shot.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${shot.label} screenshot`}
            onPress={() => router.replace(shot.route as never)}
            style={({ pressed }) => [
              styles.chip,
              { borderColor: theme.accent, backgroundColor: theme.accentMuted },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.chipText, { color: theme.accentText }]}>{shot.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  title: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.75 },
});
