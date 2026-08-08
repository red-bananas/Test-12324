import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PageStrip } from "../components/PageStrip";
import { ScreenHeader } from "../components/ScreenHeader";
import { IconToolButton } from "../components/ui";
import { displayExportPath } from "../lib/fs";
import { triggerSuccessHaptic, triggerTapHaptic } from "../lib/haptics";
import { deletePage, reorderPages, rotatePage, shouldWarnLargeDoc } from "../lib/pages";
import { pickImagesFromGallery } from "../lib/picker";
import { exportPdf } from "../lib/pdf";
import { addRecent } from "../lib/recents";
import { defaultExportSettings, loadExportSettings } from "../lib/settings";
import { clearSession, getSessionPages, setSessionPages } from "../lib/session";
import { AppTheme, useAppTheme } from "../lib/theme";
import { MAX_PAGES, type ExportSettings, type PdfPage } from "../lib/types";

export default function EditorScreen() {
  const router = useRouter();
  const { e2e } = useLocalSearchParams<{ e2e?: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState<ExportSettings>(defaultExportSettings);

  const leaveEditor = useCallback(() => {
    clearSession();
    router.replace("/");
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (e2e !== "1") {
        const latestPages = getSessionPages();
        if (latestPages.length > 0) {
          setPages(latestPages);
          setSelectedIndex((current) => Math.min(current, latestPages.length - 1));
        }
      }
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        leaveEditor();
        return true;
      });
      return () => subscription.remove();
    }, [e2e, leaveEditor]),
  );

  useEffect(() => {
    void loadExportSettings().then(setSettings);
    if (e2e === "1") {
      const fixture: PdfPage[] = [
        {
          id: "e2e-page-1",
          uri: "https://placehold.co/600x800/1c2230/6366f1/png?text=Page+1",
          width: 600,
          height: 800,
          rotation: 0,
        },
      ];
      setSessionPages(fixture);
      setPages(fixture);
      return;
    }
    const initial = getSessionPages();
    if (initial.length === 0) {
      router.replace("/");
      return;
    }
    setPages(initial);
  }, [router, e2e]);

  const syncPages = (next: PdfPage[], nextSelectedIndex = selectedIndex) => {
    setPages(next);
    setSessionPages(next);
    setSelectedIndex(Math.min(Math.max(0, nextSelectedIndex), Math.max(0, next.length - 1)));
  };

  const onRotate = async () => {
    await triggerTapHaptic();
    syncPages(pages.map((page, index) => (index === selectedIndex ? rotatePage(page) : page)));
  };

  const onCrop = async () => {
    await triggerTapHaptic();
    router.push({ pathname: "/crop", params: { index: String(selectedIndex) } });
  };

  const onAddPages = async () => {
    await triggerTapHaptic();
    try {
      const added = await pickImagesFromGallery();
      if (added.length === 0) return;
      const available = MAX_PAGES - pages.length;
      const accepted = added.slice(0, available);
      const next = [...pages, ...accepted];
      syncPages(next, pages.length);
      if (accepted.length < added.length) {
        Alert.alert("Page limit reached", `A PDF can contain up to ${MAX_PAGES} pages.`);
      }
    } catch {
      Alert.alert("Couldn't add photos", "Try selecting JPG or PNG photos.");
    }
  };

  const onDelete = () => {
    if (pages.length <= 1) {
      Alert.alert("Keep at least one page");
      return;
    }
    Alert.alert("Delete this page?", `Page ${selectedIndex + 1} will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => syncPages(deletePage(pages, selectedIndex), selectedIndex),
      },
    ]);
  };

  const runExport = async () => {
    const currentSettings = await loadExportSettings();
    setExporting(true);
    try {
      const result = await exportPdf(pages, currentSettings);
      await addRecent({
        id: result.fileName,
        name: result.fileName,
        path: result.filePath,
        sizeBytes: result.sizeBytes,
        pageCount: result.pageCount,
        createdAt: new Date().toISOString(),
      });
      await triggerSuccessHaptic();
      setSessionPages([]);
      router.replace({
        pathname: "/success",
        params: {
          name: result.fileName,
          path: result.filePath,
          sizeBytes: String(result.sizeBytes),
          pageCount: String(result.pageCount),
          displayPath: displayExportPath(result.filePath),
        },
      });
    } catch (error) {
      Alert.alert(
        "Export failed",
        error instanceof Error ? error.message : "Try fewer pages or free up storage.",
      );
    } finally {
      setExporting(false);
    }
  };

  const onExport = () => {
    if (pages.length === 0) {
      Alert.alert("Add at least one page");
      return;
    }
    if (shouldWarnLargeDoc(pages.length)) {
      Alert.alert(
        "Large document",
        `${pages.length} pages may take a while and use more memory. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Create PDF", onPress: () => void runExport() },
        ],
      );
      return;
    }
    void runExport();
  };

  const current = pages[selectedIndex];
  const qualityLabel = settings.jpegQuality >= 0.94 ? "Best" : settings.jpegQuality <= 0.71 ? "Smaller" : "Balanced";

  return (
    <View style={[styles.screen, { paddingTop: insets.top + theme.space.xs }]}>
      <ScreenHeader
        title="Edit document"
        subtitle={
          e2e === "1"
            ? `${pages.length} pages`
            : `${pages.length} ${pages.length === 1 ? "page" : "pages"}`
        }
        onBack={leaveEditor}
        rightSlot={
          <Pressable
            onPress={() => void onAddPages()}
            accessibilityRole="button"
            accessibilityLabel="Add more photos"
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Ionicons name="add" size={18} color={theme.accentBright} />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        }
      />

      {current ? (
        <View style={styles.previewStage}>
          <Image
            source={{ uri: current.uri }}
            style={[styles.preview, current.rotation % 180 === 90 && styles.previewRotated]}
            resizeMode="contain"
          />
          <View style={styles.pageCount}>
            <Text style={styles.pageCountText}>{selectedIndex + 1} of {pages.length}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.toolRow}>
        <IconToolButton icon="crop-outline" label="Crop" onPress={() => void onCrop()} />
        <IconToolButton icon="refresh-outline" label="Rotate" onPress={() => void onRotate()} />
        <IconToolButton icon="trash-outline" label="Delete" onPress={onDelete} danger />
      </View>

      <PageStrip
        pages={pages}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onReorder={(fromIndex, toIndex) => {
          syncPages(reorderPages(pages, fromIndex, toIndex), toIndex);
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        <Pressable
          onPress={onExport}
          disabled={exporting}
          accessibilityRole="button"
          accessibilityLabel="Export PDF"
          accessibilityState={{ busy: exporting }}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && !exporting && styles.exportPressed,
            exporting && styles.exportDisabled,
          ]}
        >
          <View style={styles.exportLabel}>
            {exporting ? (
              <ActivityIndicator color={theme.accentText} />
            ) : (
              <Ionicons name="document-text-outline" size={20} color={theme.accentText} />
            )}
            <Text style={styles.exportText}>{exporting ? "Creating PDF…" : "Create PDF"}</Text>
          </View>
          <Text style={styles.exportMeta}>{settings.paperSize} · {qualityLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: theme.space.md, gap: 10 },
    addButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 3,
      paddingHorizontal: 2,
    },
    addText: { color: theme.accentBright, fontSize: 12, fontWeight: "700" },
    previewStage: {
      flex: 1,
      minHeight: 210,
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    preview: { width: "100%", height: "100%" },
    previewRotated: { transform: [{ rotate: "90deg" }] },
    pageCount: {
      position: "absolute",
      right: 12,
      bottom: 12,
      backgroundColor: theme.surfaceOverlay,
      borderRadius: theme.radius.sm,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    pageCountText: { color: theme.textSecondary, fontSize: 11, fontWeight: "700" },
    toolRow: { flexDirection: "row", justifyContent: "center" },
    footer: {
      marginHorizontal: -theme.space.md,
      paddingHorizontal: theme.space.md,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.bgElevated,
    },
    exportButton: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.accent,
      ...theme.shadow.accent,
    },
    exportLabel: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
    exportText: { color: theme.accentText, fontSize: 16, fontWeight: "700" },
    exportMeta: { color: "rgba(255,255,255,0.76)", fontSize: 11, fontWeight: "500" },
    exportPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
    exportDisabled: { opacity: 0.65 },
    pressed: { opacity: 0.65 },
  });
}
