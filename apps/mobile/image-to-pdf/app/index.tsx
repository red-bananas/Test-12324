import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedback } from "../components/Feedback";
import { RecentList, type RecentPdfAction } from "../components/RecentList";
import { triggerTapHaptic } from "../lib/haptics";
import { pickImagesFromGallery, warmGalleryPicker } from "../lib/picker";
import { loadRecents, sortRecentsDesc } from "../lib/recents";
import { clearSession, setSessionPages } from "../lib/session";
import { openFile, saveCopyToFiles, shareFile, showInFilesLocation, isBenignShareError } from "../lib/share";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { RecentPdf } from "../lib/types";

export default function HubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { showToast, showMessage } = useFeedback();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [recents, setRecents] = useState<RecentPdf[]>([]);

  const refreshRecents = useCallback(async () => {
    setRecents(sortRecentsDesc(await loadRecents()));
  }, []);

  useEffect(() => {
    warmGalleryPicker();
  }, []);

  useFocusEffect(
    useCallback(() => {
      warmGalleryPicker();
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
    try {
      const pages = await pickImagesFromGallery();
      if (pages.length === 0) return;
      setSessionPages(pages);
      router.push("/editor");
    } catch {
      showMessage("Couldn't read images", "One or more photos could not be opened. Try different images.");
    }
  };

  const openRecent = async (item: RecentPdf) => {
    await triggerTapHaptic();
    try {
      await openFile(item.path);
    } catch {
      showMessage("Couldn't open PDF", "The file may have been moved or removed.");
    }
  };

  const handleRecentAction = async (item: RecentPdf, action: RecentPdfAction) => {
    await triggerTapHaptic();
    try {
      if (action === "open") {
        await openFile(item.path);
        return;
      }
      if (action === "share") {
        await shareFile(item.path);
        return;
      }
      if (action === "showInFiles") {
        await showInFilesLocation(item.path);
        return;
      }
      const copied = await saveCopyToFiles(item.path, item.name);
      if (copied) {
        showToast("Copy saved to the folder you selected.", "success");
      }
    } catch (error) {
      if (action === "share" && isBenignShareError(error)) return;
      if (action === "share") {
        showMessage("Couldn't share PDF", "The file may have been moved or removed.");
        return;
      }
      if (action === "showInFiles") {
        showMessage("Couldn't open in Files", "Open Files and browse Android/data for this app.");
        return;
      }
      if (action === "saveAs") {
        showMessage("Couldn't save a copy", "Choose another folder and try again.");
        return;
      }
      showMessage("Couldn't open PDF", "The file may have been moved or removed.");
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + theme.space.sm, paddingHorizontal: theme.space.md },
        ]}
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image
              source={require("../assets/app-logo.png")}
              style={styles.brandLogo}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
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

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => void openGallery()}
            accessibilityRole="button"
            accessibilityLabel="Pick from gallery"
            style={({ pressed }) => [styles.galleryTile, pressed && styles.primaryPressed]}
          >
            <View style={styles.galleryIcon}>
              <Ionicons name="images-outline" size={24} color={theme.accentBright} />
            </View>
            <Text style={styles.galleryTitle}>Gallery</Text>
            <Text style={styles.gallerySubtitle}>Pick photos</Text>
          </Pressable>

          <Pressable
            onPress={() => void openCamera()}
            accessibilityRole="button"
            accessibilityLabel="Open camera"
            style={({ pressed }) => [styles.cameraTile, pressed && styles.pressed]}
          >
            <View style={styles.cameraIcon}>
              <Ionicons name="camera-outline" size={22} color={theme.accentBright} />
            </View>
            <Text style={styles.cameraTitle}>Camera</Text>
            <Text style={styles.cameraSubtitle}>Scan pages</Text>
          </Pressable>
        </View>

        <View style={styles.trustLine} accessibilityLabel="Private, works offline, no watermark">
          <Ionicons name="shield-checkmark-outline" size={15} color={theme.success} />
          <Text style={styles.trustText}>Private</Text>
          <Text style={styles.trustDot}>•</Text>
          <Text style={styles.trustText}>100% offline</Text>
          <Text style={styles.trustDot}>•</Text>
          <Text style={styles.trustText}>No watermark</Text>
        </View>

        <View style={styles.recentsHeading}>
          <Text style={styles.sectionTitle}>
            {recents.length === 0 ? "No recent PDFs" : "Recent PDFs"}
          </Text>
          {recents.length > 0 ? <Text style={styles.sectionMeta}>{recents.length} files</Text> : null}
        </View>
      </View>

      <RecentList
        items={recents}
        onPress={openRecent}
        onMenuAction={handleRecentAction}
        style={styles.recentsList}
        contentContainerStyle={{
          paddingHorizontal: theme.space.md,
          paddingBottom: insets.bottom + theme.space.xl,
        }}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg },
    header: { gap: 12 },
    topBar: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    brand: { flexDirection: "row", alignItems: "center", gap: 10 },
    brandLogo: {
      width: 44,
      height: 44,
      borderRadius: 12,
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
    intro: { marginTop: theme.space.xs, gap: 6 },
    headline: { ...theme.type.hero, color: theme.text },
    subhead: { color: theme.textSecondary, fontSize: 14, lineHeight: 20 },
    actionsRow: { flexDirection: "row", gap: 10 },
    galleryTile: {
      flex: 1,
      minHeight: 108,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: theme.space.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.accent,
      ...theme.shadow.accent,
    },
    primaryPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
    galleryIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    galleryTitle: { color: theme.accentBright, fontSize: 15, fontWeight: "700" },
    gallerySubtitle: { color: theme.textSecondary, fontSize: 11, textAlign: "center" },
    cameraTile: {
      flex: 1,
      minHeight: 108,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: theme.space.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cameraIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraTitle: { color: theme.text, fontSize: 15, fontWeight: "700" },
    cameraSubtitle: { color: theme.textTertiary, fontSize: 11, textAlign: "center" },
    trustLine: {
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    trustText: { color: theme.textTertiary, fontSize: 11 },
    trustDot: { color: theme.borderStrong, fontSize: 11 },
    recentsHeading: {
      minHeight: 32,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: theme.space.xs,
    },
    sectionTitle: { color: theme.textSecondary, fontSize: 13, fontWeight: "700" },
    sectionMeta: { color: theme.textTertiary, fontSize: 11 },
    recentsList: { flex: 1 },
    pressed: { opacity: 0.7 },
  });
}
