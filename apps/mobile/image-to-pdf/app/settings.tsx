import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedback } from "../components/Feedback";
import { ScreenHeader } from "../components/ScreenHeader";
import { OptionPill, SegmentedControl } from "../components/ui";
import { clearSavedPdfs, formatFileSize, getSavedPdfsStorageBytes } from "../lib/fs";
import { clearRecents } from "../lib/recents";
import { defaultExportSettings, loadExportSettings, saveExportSettings } from "../lib/settings";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { AppearancePreference, ExportSettings, PaperSize } from "../lib/types";

const QUALITY_OPTIONS = [
  { label: "Smaller", sublabel: "70%", value: 0.7 },
  { label: "Balanced", sublabel: "85%", value: 0.85 },
  { label: "Best", sublabel: "95%", value: 0.95 },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, appearance, setAppearance } = useAppTheme();
  const { confirm, showToast } = useFeedback();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [settings, setSettings] = useState<ExportSettings>(defaultExportSettings);
  const [storageBytes, setStorageBytes] = useState(0);
  const [clearing, setClearing] = useState(false);

  const refreshStorage = useCallback(async () => {
    setStorageBytes(await getSavedPdfsStorageBytes());
  }, []);

  useEffect(() => {
    void loadExportSettings().then(setSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStorage();
    }, [refreshStorage]),
  );

  const update = async (patch: Partial<ExportSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveExportSettings(next);
  };

  const updateAppearance = async (value: AppearancePreference) => {
    setSettings((current) => ({ ...current, appearance: value }));
    await setAppearance(value);
  };

  const clearSaved = () => {
    if (storageBytes <= 0 || clearing) return;
    confirm({
      title: "Clear saved PDFs?",
      message: "This removes all PDFs saved in app storage. Shared copies elsewhere are not affected.",
      confirmLabel: "Clear",
      destructive: true,
      onConfirm: async () => {
        setClearing(true);
        try {
          const removed = await clearSavedPdfs();
          await clearRecents();
          await refreshStorage();
          showToast(removed > 0 ? `${removed} saved PDF${removed === 1 ? "" : "s"} removed.` : "No saved PDFs to remove.", "success");
        } catch {
          showToast("Couldn't clear saved PDFs.", "error");
        } finally {
          setClearing(false);
        }
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + theme.space.xs, paddingBottom: insets.bottom + theme.space.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Settings" onBack={() => router.back()} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PDF defaults</Text>
          <View style={styles.group}>
            <View style={styles.field}>
              <View style={styles.fieldHeading}>
                <View style={styles.fieldIcon}><Ionicons name="document-outline" size={18} color={theme.accentBright} /></View>
                <View style={styles.fieldCopy}>
                  <Text style={styles.fieldTitle}>Paper size</Text>
                  <Text style={styles.fieldHint}>Used for every new PDF</Text>
                </View>
              </View>
              <SegmentedControl<PaperSize>
                options={[{ value: "A4", label: "A4" }, { value: "LETTER", label: "Letter" }]}
                value={settings.paperSize}
                onChange={(paperSize) => void update({ paperSize })}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <View style={styles.fieldHeading}>
                <View style={styles.fieldIcon}><Ionicons name="image-outline" size={18} color={theme.accentBright} /></View>
                <View style={styles.fieldCopy}>
                  <Text style={styles.fieldTitle}>Image quality</Text>
                  <Text style={styles.fieldHint}>Balance clarity and file size</Text>
                </View>
              </View>
              <View style={styles.qualityGrid}>
                {QUALITY_OPTIONS.map((option) => (
                  <OptionPill
                    key={option.value}
                    label={option.label}
                    sublabel={option.sublabel}
                    selected={settings.jpegQuality === option.value}
                    onPress={() => void update({ jpegQuality: option.value })}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.group}>
            <View style={styles.field}>
              <View style={styles.toggleRow}>
                <View style={styles.fieldHeading}>
                  <View style={styles.fieldIcon}><Ionicons name="save-outline" size={18} color={theme.accentBright} /></View>
                  <View style={styles.fieldCopy}>
                    <Text style={styles.fieldTitle}>Save exports automatically</Text>
                    <Text style={styles.fieldHint}>Keep every PDF in app storage after Create</Text>
                  </View>
                </View>
                <Switch
                  value={settings.saveExportsAutomatically ?? false}
                  onValueChange={(value) => void update({ saveExportsAutomatically: value })}
                  trackColor={{ false: theme.borderStrong, true: theme.accentMuted }}
                  thumbColor={theme.accent}
                  accessibilityLabel="Save exports automatically"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.field}>
              <View style={styles.fieldHeading}>
                <View style={styles.fieldIcon}><Ionicons name="folder-outline" size={18} color={theme.accentBright} /></View>
                <View style={styles.fieldCopy}>
                  <Text style={styles.fieldTitle}>Saved PDFs</Text>
                  <Text style={styles.fieldHint}>{formatFileSize(storageBytes)} in app storage</Text>
                </View>
              </View>
              <Pressable
                onPress={clearSaved}
                disabled={storageBytes <= 0 || clearing}
                accessibilityRole="button"
                accessibilityLabel="Clear saved PDFs"
                accessibilityState={{ disabled: storageBytes <= 0 || clearing }}
                style={({ pressed }) => [
                  styles.clearButton,
                  (storageBytes <= 0 || clearing) && styles.clearButtonDisabled,
                  pressed && storageBytes > 0 && !clearing && styles.pressed,
                ]}
              >
                <Text style={[styles.clearButtonText, (storageBytes <= 0 || clearing) && styles.clearButtonTextDisabled]}>
                  {clearing ? "Clearing…" : "Clear saved PDFs"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.group}>
            <View style={styles.field}>
              <View style={styles.fieldHeading}>
                <View style={styles.fieldIcon}><Ionicons name="color-palette-outline" size={18} color={theme.accentBright} /></View>
                <View style={styles.fieldCopy}>
                  <Text style={styles.fieldTitle}>App theme</Text>
                  <Text style={styles.fieldHint}>System follows your device setting</Text>
                </View>
              </View>
              <SegmentedControl<AppearancePreference>
                options={[
                  { value: "system", label: "System" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                value={appearance}
                onChange={(value) => void updateAppearance(value)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & app</Text>
          <View style={styles.privacyGroup}>
            <View style={styles.privacyIcon}><Ionicons name="shield-checkmark-outline" size={21} color={theme.success} /></View>
            <View style={styles.privacyCopy}>
              <Text style={styles.privacyTitle}>Your files stay private</Text>
              <Text style={styles.privacyText}>Everything happens offline on this device. No account or uploads.</Text>
            </View>
          </View>
        </View>

        <Text style={styles.version}>Image to PDF · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg },
    scroll: { paddingHorizontal: theme.space.md, gap: theme.space.lg },
    section: { gap: theme.space.sm },
    sectionTitle: {
      color: theme.textTertiary,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginLeft: 2,
    },
    group: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.lg,
      overflow: "hidden",
    },
    field: { padding: theme.space.md, gap: theme.space.md },
    toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.space.sm },
    fieldHeading: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    fieldIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    fieldCopy: { flex: 1, gap: 3 },
    fieldTitle: { color: theme.text, fontSize: 13, fontWeight: "700" },
    fieldHint: { color: theme.textTertiary, fontSize: 11 },
    divider: { height: 1, backgroundColor: theme.border, marginHorizontal: theme.space.md },
    qualityGrid: { flexDirection: "row", gap: theme.space.sm },
    clearButton: {
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.danger,
      backgroundColor: theme.dangerMuted,
    },
    clearButtonDisabled: { opacity: 0.45, borderColor: theme.border },
    clearButtonText: { color: theme.danger, fontSize: 13, fontWeight: "700" },
    clearButtonTextDisabled: { color: theme.textTertiary },
    pressed: { opacity: 0.7 },
    privacyGroup: {
      minHeight: 96,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: theme.space.md,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: theme.radius.lg,
    },
    privacyIcon: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.md,
      backgroundColor: theme.successMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    privacyCopy: { flex: 1, gap: 5 },
    privacyTitle: { color: theme.text, fontSize: 13, fontWeight: "700" },
    privacyText: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
    version: { color: theme.textTertiary, fontSize: 11, textAlign: "center" },
  });
}
