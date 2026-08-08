import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecentList } from "../components/RecentList";
import { triggerTapHaptic } from "../lib/haptics";
import { pickImagesFromGallery } from "../lib/picker";
import { loadRecents, sortRecentsDesc } from "../lib/recents";
import { clearSession, setSessionPages } from "../lib/session";
import { openFile } from "../lib/share";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { RecentPdf } from "../lib/types";

export default function HubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [recents, setRecents] = useState<RecentPdf[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const refreshRecents = useCallback(async () => {
    setRecents(sortRecentsDesc(await loadRecents()));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshRecents();
    }, [refreshRecents]),
  );

  const openCamera = async () => {
    await triggerTapHaptic();
    clearSession();
    router.push("/camera");
  };

  const openGallery = async () => {
    await triggerTapHaptic();
    setLoadingGallery(true);
    try {
      const pages = await pickImagesFromGallery();
      if (pages.length === 0) return;
      setSessionPages(pages);
      router.push("/editor");
    } catch {
      Alert.alert("Couldn't read images", "Try selecting JPG or PNG photos.");
    } finally {
      setLoadingGallery(false);
    }
  };

  const openRecent = async (item: RecentPdf) => {
    await triggerTapHaptic();
    try {
      await openFile(item.path);
    } catch {
      Alert.alert("Couldn't open PDF", "The file may have been moved or removed.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + theme.space.sm, paddingBottom: insets.bottom + theme.space.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="documents-outline" size={19} color={theme.accentText} />
            </View>
            <Text style={styles.appTitle}>Image to PDF</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          >
            <Ionicons name="options-outline" size={21} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.intro}>
          <Text style={styles.headline}>Create a PDF</Text>
          <Text style={styles.subhead}>Turn photos into one clean, shareable document.</Text>
        </View>

        <Pressable
          onPress={() => void openGallery()}
          disabled={loadingGallery}
          accessibilityRole="button"
          accessibilityLabel="Pick from gallery"
          accessibilityState={{ busy: loadingGallery }}
          style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryPressed]}
        >
          <View style={styles.primaryIcon}>
            {loadingGallery ? (
              <ActivityIndicator color={theme.accentText} />
            ) : (
              <Ionicons name="images-outline" size={25} color={theme.accentText} />
            )}
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.primaryTitle}>{loadingGallery ? "Loading photos…" : "Gallery"}</Text>
            <Text style={styles.primarySubtitle}>Choose multiple photos from your device</Text>
          </View>
          <Ionicons name="arrow-forward" size={21} color={theme.accentText} />
        </Pressable>

        <Pressable
          onPress={() => void openCamera()}
          accessibilityRole="button"
          accessibilityLabel="Open camera"
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
        >
          <View style={styles.secondaryIcon}>
            <Ionicons name="camera-outline" size={22} color={theme.accentBright} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.secondaryTitle}>Camera</Text>
            <Text style={styles.secondarySubtitle}>Scan pages one by one</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
        </Pressable>

        <View style={styles.trustLine} accessibilityLabel="Private, works offline, no watermark">
          <Ionicons name="shield-checkmark-outline" size={15} color={theme.success} />
          <Text style={styles.trustText}>Private</Text>
          <Text style={styles.trustDot}>•</Text>
          <Text style={styles.trustText}>100% offline</Text>
          <Text style={styles.trustDot}>•</Text>
          <Text style={styles.trustText}>No watermark</Text>
        </View>

        <View style={styles.recentsSection}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Recent PDFs</Text>
            {recents.length > 5 ? <Text style={styles.sectionMeta}>{recents.length} files</Text> : null}
          </View>
          <RecentList items={recents} onPress={openRecent} />
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg },
    scroll: { paddingHorizontal: theme.space.md, gap: 12 },
    topBar: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    brand: { flexDirection: "row", alignItems: "center", gap: 10 },
    brandMark: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    appTitle: { ...theme.type.bodyStrong, color: theme.text, fontSize: 17 },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
    },
    intro: { marginTop: theme.space.md, marginBottom: theme.space.sm, gap: 6 },
    headline: { ...theme.type.hero, color: theme.text },
    subhead: { color: theme.textSecondary, fontSize: 14, lineHeight: 20 },
    primaryAction: {
      minHeight: 94,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      padding: theme.space.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.accent,
      ...theme.shadow.accent,
    },
    primaryPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
    primaryIcon: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.md,
      backgroundColor: "rgba(255,255,255,0.16)",
      alignItems: "center",
      justifyContent: "center",
    },
    actionCopy: { flex: 1, gap: 4 },
    primaryTitle: { color: theme.accentText, fontSize: 16, fontWeight: "700" },
    primarySubtitle: { color: "rgba(255,255,255,0.76)", fontSize: 12, lineHeight: 17 },
    secondaryAction: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      padding: 14,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryIcon: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryTitle: { color: theme.text, fontSize: 15, fontWeight: "700" },
    secondarySubtitle: { color: theme.textTertiary, fontSize: 12 },
    trustLine: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    trustText: { color: theme.textTertiary, fontSize: 11 },
    trustDot: { color: theme.borderStrong, fontSize: 11 },
    recentsSection: { marginTop: theme.space.sm },
    sectionHeading: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sectionTitle: { color: theme.textSecondary, fontSize: 13, fontWeight: "700" },
    sectionMeta: { color: theme.textTertiary, fontSize: 11 },
    pressed: { opacity: 0.7 },
  });
}
