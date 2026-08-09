import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedback } from "../components/Feedback";
import { PageStrip } from "../components/PageStrip";
import { ScreenHeader } from "../components/ScreenHeader";
import { IconToolButton } from "../components/ui";
import { triggerSuccessHaptic, triggerTapHaptic } from "../lib/haptics";
import { deletePage, reorderPages, rotatePage, shouldWarnLargeDoc } from "../lib/pages";
import { pickImagesFromGallery, warmGalleryPicker } from "../lib/picker";
import { exportPdf } from "../lib/pdf";
import { deleteIfExists, savePdfToAppStorage } from "../lib/fs";
import { addRecent } from "../lib/recents";
import { loadExportSettings } from "../lib/settings";
import { clearSession, getSessionPages, setSessionPages } from "../lib/session";
import { AppTheme, useAppTheme } from "../lib/theme";
import { MAX_PAGES, type PdfPage } from "../lib/types";

export default function EditorScreen() {
  const router = useRouter();
  const { e2e } = useLocalSearchParams<{ e2e?: string }>();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { showMessage, confirm } = useFeedback();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const selectedIndexRef = useRef(selectedIndex);
  const pageCountRef = useRef(pages.length);
  selectedIndexRef.current = selectedIndex;
  pageCountRef.current = pages.length;

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
    warmGalleryPicker();
    try {
      const added = await pickImagesFromGallery();
      if (added.length === 0) return;
      const available = MAX_PAGES - pages.length;
      const accepted = added.slice(0, available);
      const next = [...pages, ...accepted];
      syncPages(next, pages.length);
      if (accepted.length < added.length) {
        showMessage("Page limit reached", `A PDF can contain up to ${MAX_PAGES} pages.`);
      }
    } catch {
      showMessage("Couldn't add photos", "One or more images could not be opened. Try different photos.");
    }
  };

  const onDelete = () => {
    if (pages.length <= 1) {
      clearSession();
      router.replace("/");
      return;
    }
    confirm({
      title: "Delete this page?",
      message: `Page ${selectedIndex + 1} will be removed.`,
      confirmLabel: "Delete",
      destructive: true,
      onConfirm: () => syncPages(deletePage(pages, selectedIndex), selectedIndex),
    });
  };

  const runExport = async () => {
    const currentSettings = await loadExportSettings();
    setExporting(true);
    try {
      let result = await exportPdf(pages, currentSettings);
      if (currentSettings.saveExportsAutomatically) {
        const previousPath = result.filePath;
        const stored = await savePdfToAppStorage(previousPath, result.fileName);
        if (previousPath !== stored.filePath) {
          await deleteIfExists(previousPath);
        }
        await addRecent({
          id: stored.fileName,
          name: stored.fileName,
          path: stored.filePath,
          sizeBytes: result.sizeBytes,
          pageCount: result.pageCount,
          createdAt: new Date().toISOString(),
        });
        result = {
          ...result,
          filePath: stored.filePath,
          fileName: stored.fileName,
          saved: true,
        };
      }
      await triggerSuccessHaptic();
      router.replace({
        pathname: "/success",
        params: {
          name: result.fileName,
          path: result.filePath,
          sizeBytes: String(result.sizeBytes),
          pageCount: String(result.pageCount),
          saved: result.saved ? "1" : "0",
        },
      });
    } catch (error) {
      showMessage(
        "Export failed",
        error instanceof Error ? error.message : "Try fewer pages or free up storage.",
      );
    } finally {
      setExporting(false);
    }
  };

  const onExport = () => {
    if (pages.length === 0) {
      showMessage("Add at least one page");
      return;
    }
    if (shouldWarnLargeDoc(pages.length)) {
      confirm({
        title: "Large document",
        message: `${pages.length} pages may take a while and use more memory. Continue?`,
        confirmLabel: "Create PDF",
        onConfirm: () => void runExport(),
      });
      return;
    }
    void runExport();
  };

  const current = pages[selectedIndex];
  const editorSubtitle = `${pages.length} ${pages.length === 1 ? "page" : "pages"}`;

  const previewSwipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 8,
        onPanResponderRelease: (_, gesture) => {
          const index = selectedIndexRef.current;
          const count = pageCountRef.current;
          if (gesture.dx < -16 && index < count - 1) {
            void triggerTapHaptic();
            setSelectedIndex(index + 1);
          } else if (gesture.dx > 16 && index > 0) {
            void triggerTapHaptic();
            setSelectedIndex(index - 1);
          }
        },
      }),
    [],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + theme.space.xs, paddingBottom: insets.bottom + theme.space.md }]}>
      <ScreenHeader
        title="Edit document"
        subtitle={editorSubtitle}
        onBack={leaveEditor}
        rightSlot={
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
            {exporting ? (
              <ActivityIndicator size="small" color={theme.accentText} />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={16} color={theme.accentText} />
                <Text style={styles.exportText}>Create</Text>
              </>
            )}
          </Pressable>
        }
      />

      {current ? (
        <View
          style={styles.previewStage}
          accessibilityLabel={`Page ${selectedIndex + 1} of ${pages.length}. Swipe left or right to change page.`}
          {...previewSwipe.panHandlers}
        >
          <Image
            key={current.uri}
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
        onAddPages={() => void onAddPages()}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: theme.space.md, gap: 10 },
    exportButton: {
      height: 36,
      minWidth: 88,
      paddingHorizontal: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    exportText: { color: theme.accentText, fontSize: 12, fontWeight: "700" },
    exportPressed: { opacity: 0.65 },
    exportDisabled: { opacity: 0.55 },
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
  });
}
