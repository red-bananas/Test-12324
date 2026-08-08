import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Linking,
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
import { PrimaryButton } from "../components/ui";
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

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [pages, setPages] = useState<PdfPage[]>(() => getSessionPages());
  const [flash, setFlash] = useState(false);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const close = useCallback(() => {
    if (pages.length > 0) {
      Alert.alert("Discard captured pages?", "These pages have not been added to a PDF yet.", [
        { text: "Keep scanning", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setSessionPages([]);
            router.back();
          },
        },
      ]);
      return;
    }
    router.back();
  }, [pages.length, router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        close();
        return true;
      });
      return () => subscription.remove();
    }, [close]),
  );

  const capture = async () => {
    if (!canAddPage(pages.length)) {
      Alert.alert("Page limit reached", "Maximum 500 pages per document.");
      return;
    }
    await triggerTapHaptic();
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.92, skipProcessing: false });
    if (!photo?.uri) return;
    setPages((current) => [
      ...current,
      {
        id: createPageId(),
        uri: photo.uri,
        width: photo.width ?? 0,
        height: photo.height ?? 0,
        rotation: 0,
      },
    ]);
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

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={styles.camera} facing="back" enableTorch={flash} />
      <View style={styles.cameraOverlay} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + theme.space.sm }]}>
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

        <View style={styles.guide} pointerEvents="none">
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <View style={styles.hintPill}><Text style={styles.hint}>Align the page inside the frame</Text></View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + theme.space.md }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
            {pages.length === 0 ? (
              <View style={styles.emptyThumb}><Text style={styles.emptyThumbText}>Captured pages appear here</Text></View>
            ) : (
              pages.map((page, index) => (
                <View key={page.id} style={[styles.thumb, index === pages.length - 1 && styles.thumbCurrent]}>
                  <Image source={{ uri: page.uri }} style={styles.thumbImage} />
                  <View style={styles.thumbBadge}><Text style={styles.thumbLabel}>{index + 1}</Text></View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={styles.controls}>
            <View style={styles.sideSlot} />
            <Pressable
              onPress={() => void capture()}
              accessibilityRole="button"
              accessibilityLabel="Capture page"
              style={({ pressed }) => [styles.shutter, pressed && styles.shutterPressed]}
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
                  <View style={styles.doneCount}><Text style={styles.doneCountText}>{pages.length}</Text></View>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#000000" },
    camera: { flex: 1 },
    cameraOverlay: { ...StyleSheet.absoluteFillObject },
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
      paddingHorizontal: theme.space.md,
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
    guide: { position: "absolute", top: "19%", left: "13%", right: "13%", bottom: "28%" },
    corner: { position: "absolute", width: 34, height: 34, borderColor: "#A9A2FF" },
    topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
    topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
    hintPill: { position: "absolute", top: "68%", left: 0, right: 0, alignItems: "center" },
    hint: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 12,
      fontWeight: "600",
      backgroundColor: theme.cameraChrome,
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: theme.radius.full,
      overflow: "hidden",
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      gap: theme.space.md,
      paddingHorizontal: theme.space.md,
      paddingTop: theme.space.lg,
      backgroundColor: "rgba(5,6,8,0.82)",
    },
    thumbs: { minHeight: 58, alignItems: "center", gap: theme.space.sm, paddingHorizontal: 2 },
    emptyThumb: {
      minHeight: 50,
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyThumbText: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
    thumb: {
      width: 44,
      height: 56,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.34)",
    },
    thumbCurrent: { borderColor: "#A9A2FF" },
    thumbImage: { width: "100%", height: "100%" },
    thumbBadge: {
      position: "absolute",
      bottom: 3,
      right: 3,
      width: 15,
      height: 15,
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
    doneButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accent,
    },
    doneText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    doneCount: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
    doneCountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
    pressed: { opacity: 0.7 },
  });
}
