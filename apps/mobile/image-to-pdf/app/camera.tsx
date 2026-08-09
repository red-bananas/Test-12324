import { useCallback, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedback } from "../components/Feedback";
import { PrimaryButton } from "../components/ui";
import { cropCaptureToPreviewFrame } from "../lib/cameraCapture";
import { canAddPage, createPageId } from "../lib/pages";
import { getSessionPages, setSessionPages } from "../lib/session";
import { triggerTapHaptic } from "../lib/haptics";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { PdfPage } from "../lib/types";

function PermissionScreen({
  message,
  primaryLabel,
  onPrimary,
  onSecondary,
  secondaryLabel,
}: {
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.permissionScreen, { paddingTop: insets.top + theme.space.xxl }]}>
      <View style={styles.permissionIcon}>
        <Ionicons name="camera-outline" size={34} color={theme.accentBright} />
      </View>
      <Text style={styles.permissionTitle}>Camera access</Text>
      <Text style={styles.permissionMessage}>{message}</Text>
      <View style={styles.permissionActions}>
        <PrimaryButton label={primaryLabel} onPress={onPrimary} />
        {onSecondary && secondaryLabel ? (
          <Pressable
            onPress={onSecondary}
            accessibilityRole="button"
            style={({ pressed }) => [styles.permissionLink, pressed && styles.pressed]}
          >
            <Text style={styles.permissionLinkText}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function PreviewGrid() {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: { ...StyleSheet.absoluteFillObject },
        lineV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.34)" },
        lineH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.34)" },
      }),
    [],
  );

  return (
    <View style={styles.grid} pointerEvents="none">
      <View style={[styles.lineV, { left: "33.33%" }]} />
      <View style={[styles.lineV, { left: "66.66%" }]} />
      <View style={[styles.lineH, { top: "33.33%" }]} />
      <View style={[styles.lineH, { top: "66.66%" }]} />
    </View>
  );
}

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [pages, setPages] = useState<PdfPage[]>(() => getSessionPages());
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { theme } = useAppTheme();
  const { showMessage, confirm } = useFeedback();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const close = useCallback(() => {
    if (pages.length > 0) {
      confirm({
        title: "Discard captured pages?",
        message: "These pages have not been added to a PDF yet.",
        confirmLabel: "Discard",
        destructive: true,
        onConfirm: () => {
          setSessionPages([]);
          router.back();
        },
      });
      return;
    }
    router.back();
  }, [confirm, pages.length, router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (previewIndex !== null) {
          setPreviewIndex(null);
          return true;
        }
        close();
        return true;
      });
      return () => subscription.remove();
    }, [close, previewIndex]),
  );

  const capture = async () => {
    if (capturing || !canAddPage(pages.length)) {
      if (!canAddPage(pages.length)) {
        showMessage("Page limit reached", "Maximum 500 pages per document.");
      }
      return;
    }
    await triggerTapHaptic();
    setCapturing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.92, skipProcessing: false });
      if (!photo?.uri) return;
      const framed = await cropCaptureToPreviewFrame({
        uri: photo.uri,
        width: photo.width ?? 0,
        height: photo.height ?? 0,
      });
      setPages((current) => [
        ...current,
        {
          id: createPageId(),
          uri: framed.uri,
          width: framed.width,
          height: framed.height,
          rotation: 0,
        },
      ]);
    } finally {
      setCapturing(false);
    }
  };

  const deletePreviewPage = () => {
    if (previewIndex === null) return;
    const index = previewIndex;
    setPages((current) => current.filter((_, i) => i !== index));
    setPreviewIndex(null);
  };

  const finish = () => {
    setSessionPages(pages);
    router.replace("/editor");
  };

  if (!permission) return <View style={styles.permissionScreen} />;

  if (!permission.granted) {
    return (
      <PermissionScreen
        message="Allow camera access to capture paper documents. Photos are processed only on this device."
        primaryLabel="Allow camera"
        onPrimary={() => void requestPermission()}
        secondaryLabel="Open Settings"
        onSecondary={() => void Linking.openSettings()}
      />
    );
  }

  if (Platform.OS === "web") {
    return (
      <PermissionScreen
        message="Camera capture requires a physical Android or iOS device."
        primaryLabel="Go back"
        onPrimary={() => router.back()}
      />
    );
  }

  const previewPage = previewIndex === null ? null : pages[previewIndex];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View style={[styles.previewRegion, { paddingTop: insets.top + theme.space.sm }]}>
        <View style={styles.topBar}>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close camera" style={styles.roundButton}>
            <Ionicons name="close" size={23} color="#FFFFFF" />
          </Pressable>
          <View style={styles.pagePill}>
            <Ionicons name="documents-outline" size={15} color="#FFFFFF" />
            <Text style={styles.pagePillText}>{pages.length} {pages.length === 1 ? "page" : "pages"}</Text>
          </View>
          <Pressable
            onPress={() => setFlash((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={flash ? "Turn flash off" : "Turn flash on"}
            accessibilityState={{ selected: flash }}
            style={[styles.roundButton, flash && styles.roundButtonActive]}
          >
            <Ionicons name={flash ? "flash" : "flash-outline"} size={21} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.cameraStage}>
          <View style={styles.cameraViewport}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" enableTorch={flash} />
            <PreviewGrid />
          </View>
        </View>
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + theme.space.md }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbScroll}
          contentContainerStyle={styles.thumbs}
        >
          {pages.length === 0 ? (
            <View style={styles.emptyThumb}>
              <Text style={styles.emptyThumbText}>Captured pages appear here</Text>
            </View>
          ) : (
            pages.map((page, index) => (
              <Pressable
                key={page.id}
                onPress={() => setPreviewIndex(index)}
                accessibilityRole="button"
                accessibilityLabel={`Preview page ${index + 1}`}
                style={[styles.thumb, index === pages.length - 1 && styles.thumbCurrent]}
              >
                <Image source={{ uri: page.uri }} style={styles.thumbImage} />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbLabel}>{index + 1}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>

        <View style={styles.controls}>
          <View style={styles.sideSlot} />
          <Pressable
            onPress={() => void capture()}
            disabled={capturing}
            accessibilityRole="button"
            accessibilityLabel="Capture page"
            style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed, capturing && styles.shutterDisabled]}
          >
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={styles.sideSlot}>
            {pages.length > 0 ? (
              <Pressable
                onPress={finish}
                accessibilityRole="button"
                accessibilityLabel={`Done, ${pages.length} ${pages.length === 1 ? "page" : "pages"}`}
                style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
              >
                <Text style={styles.doneText}>Done</Text>
                <View style={styles.doneCount}>
                  <Text style={styles.doneCountText}>{pages.length}</Text>
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <Modal visible={previewPage !== null} transparent animationType="fade" onRequestClose={() => setPreviewIndex(null)}>
        <View style={styles.previewModal}>
          <Pressable style={styles.previewDismiss} onPress={() => setPreviewIndex(null)} accessibilityLabel="Close preview" />
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>
                Page {previewIndex !== null ? previewIndex + 1 : ""}
              </Text>
              <Pressable
                onPress={() => setPreviewIndex(null)}
                accessibilityRole="button"
                accessibilityLabel="Close preview"
                style={({ pressed }) => [styles.previewClose, pressed && styles.pressed]}
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
            {previewPage ? (
              <Image source={{ uri: previewPage.uri }} style={styles.previewImage} resizeMode="contain" />
            ) : null}
            <Pressable
              onPress={deletePreviewPage}
              accessibilityRole="button"
              accessibilityLabel="Delete captured page"
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.deleteText}>Delete page</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#050608" },
    previewRegion: { flex: 1, paddingHorizontal: theme.space.md, gap: theme.space.sm },
    cameraStage: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    cameraViewport: {
      height: "100%",
      aspectRatio: 3 / 4,
      maxWidth: "100%",
      borderRadius: theme.radius.lg,
      overflow: "hidden",
      backgroundColor: "#000000",
    },
    camera: { ...StyleSheet.absoluteFillObject },
    permissionScreen: {
      flex: 1,
      backgroundColor: theme.bg,
      paddingHorizontal: theme.space.lg,
      alignItems: "center",
    },
    permissionIcon: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.space.lg,
    },
    permissionTitle: { ...theme.type.title, color: theme.text, marginBottom: theme.space.sm },
    permissionMessage: { ...theme.type.body, color: theme.textSecondary, textAlign: "center", maxWidth: 320 },
    permissionActions: { width: "100%", marginTop: theme.space.xl, gap: theme.space.sm },
    permissionLink: { minHeight: 48, alignItems: "center", justifyContent: "center" },
    permissionLinkText: { color: theme.accentBright, fontSize: 14, fontWeight: "700" },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 48,
    },
    roundButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.cameraChrome,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    roundButtonActive: { backgroundColor: "rgba(110, 97, 233, 0.76)" },
    pagePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      backgroundColor: theme.cameraChrome,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
    },
    pagePillText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
    bottomPanel: {
      gap: theme.space.md,
      paddingHorizontal: theme.space.md,
      paddingTop: theme.space.sm,
      backgroundColor: "rgba(5,6,8,0.96)",
    },
    thumbScroll: { maxHeight: 72 },
    thumbs: { flexGrow: 1, minHeight: 58, alignItems: "center", gap: theme.space.sm },
    emptyThumb: {
      flex: 1,
      width: "100%",
      minHeight: 58,
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyThumbText: { color: "rgba(255,255,255,0.62)", fontSize: 12, textAlign: "center" },
    thumb: {
      width: 48,
      height: 60,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.34)",
    },
    thumbCurrent: { borderColor: theme.accentBright },
    thumbImage: { width: "100%", height: "100%" },
    thumbBadge: {
      position: "absolute",
      bottom: 3,
      right: 3,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: "rgba(8,9,12,0.78)",
      alignItems: "center",
      justifyContent: "center",
    },
    thumbLabel: { color: "#FFFFFF", fontSize: 8, fontWeight: "800" },
    controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    sideSlot: { flex: 1, alignItems: "flex-end" },
    shutter: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 3,
      borderColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#FFFFFF" },
    shutterPressed: { transform: [{ scale: 0.94 }] },
    shutterDisabled: { opacity: 0.55 },
    doneButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: theme.radius.md,
      backgroundColor: "rgba(8,9,12,0.72)",
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    doneText: { color: theme.accentBright, fontWeight: "700", fontSize: 13 },
    doneCount: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.accentMuted,
      borderWidth: 1,
      borderColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    doneCountText: { color: theme.accentBright, fontSize: 10, fontWeight: "800" },
    previewModal: { flex: 1, justifyContent: "center", padding: theme.space.lg, backgroundColor: "rgba(0,0,0,0.72)" },
    previewDismiss: { ...StyleSheet.absoluteFillObject },
    previewCard: {
      borderRadius: theme.radius.xl,
      overflow: "hidden",
      backgroundColor: "#10131A",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      gap: theme.space.md,
      padding: theme.space.md,
    },
    previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    previewTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
    previewClose: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    previewImage: { width: "100%", aspectRatio: 3 / 4, borderRadius: theme.radius.md, backgroundColor: "#000000" },
    deleteButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: theme.radius.md,
      backgroundColor: "rgba(239,68,68,0.18)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.42)",
    },
    deleteText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    pressed: { opacity: 0.7 },
  });
}
