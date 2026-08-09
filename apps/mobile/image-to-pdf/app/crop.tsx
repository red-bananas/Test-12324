import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CropCorner,
  CropRect,
  cropRectToPixels,
  FULL_CROP,
  isFullCrop,
  resizeCrop,
  rotateCrop,
} from "../lib/crop";
import { useFeedback } from "../components/Feedback";
import { triggerTapHaptic } from "../lib/haptics";
import { getSessionPages, setSessionPages } from "../lib/session";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { PdfPage } from "../lib/types";

type Rotation = PdfPage["rotation"];
type WorkingImage = {
  pageId: string;
  uri: string;
  width: number;
  height: number;
  sourceUri: string;
  sourceWidth: number;
  sourceHeight: number;
  totalRotation: Rotation;
};
type Rect = { left: number; top: number; width: number; height: number };

function addRotation(left: Rotation, right: Rotation): Rotation {
  return ((left + right) % 360) as Rotation;
}

function cropForPage(page: PdfPage): CropRect {
  return rotateCrop(page.crop ?? FULL_CROP, page.rotation);
}

async function preparePage(page: PdfPage): Promise<WorkingImage> {
  const sourceUri = page.originalUri ?? page.uri;
  const sourceWidth = page.originalWidth ?? page.width;
  const sourceHeight = page.originalHeight ?? page.height;
  const totalRotation = addRotation(page.cropRotation ?? 0, page.rotation);

  if (totalRotation === 0) {
    return {
      pageId: page.id,
      uri: sourceUri,
      width: sourceWidth,
      height: sourceHeight,
      sourceUri,
      sourceWidth,
      sourceHeight,
      totalRotation,
    };
  }

  const result = await manipulateAsync(sourceUri, [{ rotate: totalRotation }], {
    compress: 1,
    format: SaveFormat.JPEG,
  });
  return {
    pageId: page.id,
    uri: result.uri,
    width: result.width,
    height: result.height,
    sourceUri,
    sourceWidth,
    sourceHeight,
    totalRotation,
  };
}

function makeHandleResponder(
  corner: CropCorner,
  cropRef: MutableRefObject<CropRect>,
  startRef: MutableRefObject<CropRect>,
  imageRect: Rect,
  setCrop: (value: CropRect) => void,
) {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      startRef.current = cropRef.current;
    },
    onPanResponderMove: (_, gesture) => {
      if (imageRect.width <= 0 || imageRect.height <= 0) return;
      setCrop(
        resizeCrop(
          startRef.current,
          corner,
          gesture.dx / imageRect.width,
          gesture.dy / imageRect.height,
        ),
      );
    },
  });
}

export default function CropScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { index } = useLocalSearchParams<{ index?: string }>();
  const pages = useMemo(() => getSessionPages(), []);
  const initialIndex = Math.min(Math.max(0, Number(index ?? 0)), Math.max(0, pages.length - 1));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const page = pages[selectedIndex];
  const { theme } = useAppTheme();
  const { showMessage } = useFeedback();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [working, setWorking] = useState<WorkingImage | null>(null);
  const [crop, setCropState] = useState<CropRect>(() => page ? cropForPage(page) : FULL_CROP);
  const [drafts, setDrafts] = useState<Record<string, CropRect>>({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const cropRef = useRef(crop);
  const draftsRef = useRef(drafts);
  const startCropRef = useRef<CropRect>(FULL_CROP);
  cropRef.current = crop;
  draftsRef.current = drafts;

  useEffect(() => {
    if (pages.length === 0) {
      router.replace("/");
    }
  }, [pages.length, router]);

  useEffect(() => {
    let active = true;
    if (!page) return () => { active = false; };
    setWorking(null);
    setCropState(draftsRef.current[page.id] ?? cropForPage(page));
    void preparePage(page)
      .then((result) => {
        if (active) setWorking(result);
      })
      .catch(() => {
        if (active) showMessage("Couldn't prepare this page", "Choose another page or go back and try again.");
      });
    return () => {
      active = false;
    };
  }, [page, showMessage]);

  const setCrop = useCallback((value: CropRect) => {
    if (!page) return;
    setCropState(value);
    setDrafts((current) => ({ ...current, [page.id]: value }));
    setDirtyIds((current) => new Set(current).add(page.id));
  }, [page]);

  const imageRect = useMemo<Rect>(() => {
    if (!working || stage.width <= 0 || stage.height <= 0) {
      return { left: 0, top: 0, width: 0, height: 0 };
    }
    const padding = 16;
    const availableWidth = Math.max(1, stage.width - padding * 2);
    const availableHeight = Math.max(1, stage.height - padding * 2);
    const scale = Math.min(availableWidth / working.width, availableHeight / working.height);
    const width = working.width * scale;
    const height = working.height * scale;
    return {
      left: (stage.width - width) / 2,
      top: (stage.height - height) / 2,
      width,
      height,
    };
  }, [stage, working]);

  const topLeft = useMemo(
    () => makeHandleResponder("topLeft", cropRef, startCropRef, imageRect, setCrop),
    [imageRect, setCrop],
  );
  const topRight = useMemo(
    () => makeHandleResponder("topRight", cropRef, startCropRef, imageRect, setCrop),
    [imageRect, setCrop],
  );
  const bottomLeft = useMemo(
    () => makeHandleResponder("bottomLeft", cropRef, startCropRef, imageRect, setCrop),
    [imageRect, setCrop],
  );
  const bottomRight = useMemo(
    () => makeHandleResponder("bottomRight", cropRef, startCropRef, imageRect, setCrop),
    [imageRect, setCrop],
  );

  const cropBox = {
    left: imageRect.left + crop.x * imageRect.width,
    top: imageRect.top + crop.y * imageRect.height,
    width: crop.width * imageRect.width,
    height: crop.height * imageRect.height,
  };

  const save = async () => {
    if (saving) return;
    await triggerTapHaptic();
    if (dirtyIds.size === 0) {
      router.back();
      return;
    }

    setSaving(true);
    try {
      const next = [...pages];
      for (let pageIndex = 0; pageIndex < next.length; pageIndex += 1) {
        const item = next[pageIndex];
        if (!dirtyIds.has(item.id)) continue;
        const prepared = await preparePage(item);
        const itemCrop = drafts[item.id] ?? cropForPage(item);
        const result = isFullCrop(itemCrop)
          ? prepared
          : await manipulateAsync(
              prepared.uri,
              [{ crop: cropRectToPixels(itemCrop, prepared.width, prepared.height) }],
              { compress: 0.95, format: SaveFormat.JPEG },
            );
        next[pageIndex] = {
          ...item,
          uri: result.uri,
          width: result.width,
          height: result.height,
          rotation: 0,
          originalUri: prepared.sourceUri,
          originalWidth: prepared.sourceWidth,
          originalHeight: prepared.sourceHeight,
          crop: itemCrop,
          cropRotation: prepared.totalRotation,
        };
      }
      setSessionPages(next);
      router.back();
    } catch {
      showMessage("Couldn't apply these crops", "Reset the crop area on the affected page and try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderHandle = (
    label: string,
    positionStyle: object,
    markStyle: object,
    responder: ReturnType<typeof makeHandleResponder>,
  ) => (
    <View
      accessibilityLabel={label}
      style={[styles.handleTouch, positionStyle]}
      {...responder.panHandlers}
    >
      <View style={[styles.handleMark, markStyle]} />
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + theme.space.sm }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel crop"
          style={styles.headerButton}
        >
          <Ionicons name="close" size={23} color={theme.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Crop pages</Text>
          <Text style={styles.subtitle}>{selectedIndex + 1} of {pages.length} · Edits stay adjustable</Text>
        </View>
        <Pressable
          onPress={() => void save()}
          disabled={!working || saving}
          accessibilityRole="button"
          accessibilityLabel="Apply all crop changes"
          style={[styles.doneButton, (!working || saving) && styles.disabled]}
        >
          {saving ? <ActivityIndicator size="small" color={theme.accentText} /> : <Text style={styles.doneText}>Done</Text>}
        </Pressable>
      </View>

      <View style={styles.stage} onLayout={(event) => setStage(event.nativeEvent.layout)}>
        {working ? (
          <>
            <Image source={{ uri: working.uri }} style={[styles.image, imageRect]} resizeMode="stretch" />
            <View pointerEvents="none" style={[styles.mask, { left: imageRect.left, top: imageRect.top, width: imageRect.width, height: cropBox.top - imageRect.top }]} />
            <View pointerEvents="none" style={[styles.mask, { left: imageRect.left, top: cropBox.top + cropBox.height, width: imageRect.width, height: imageRect.top + imageRect.height - cropBox.top - cropBox.height }]} />
            <View pointerEvents="none" style={[styles.mask, { left: imageRect.left, top: cropBox.top, width: cropBox.left - imageRect.left, height: cropBox.height }]} />
            <View pointerEvents="none" style={[styles.mask, { left: cropBox.left + cropBox.width, top: cropBox.top, width: imageRect.left + imageRect.width - cropBox.left - cropBox.width, height: cropBox.height }]} />
            <View pointerEvents="box-none" style={[styles.cropBox, cropBox]}>
              <View pointerEvents="none" style={[styles.gridLineVertical, { left: "33.33%" }]} />
              <View pointerEvents="none" style={[styles.gridLineVertical, { left: "66.66%" }]} />
              <View pointerEvents="none" style={[styles.gridLineHorizontal, { top: "33.33%" }]} />
              <View pointerEvents="none" style={[styles.gridLineHorizontal, { top: "66.66%" }]} />
              {renderHandle("Top left crop handle", styles.topLeft, styles.topLeftMark, topLeft)}
              {renderHandle("Top right crop handle", styles.topRight, styles.topRightMark, topRight)}
              {renderHandle("Bottom left crop handle", styles.bottomLeft, styles.bottomLeftMark, bottomLeft)}
              {renderHandle("Bottom right crop handle", styles.bottomRight, styles.bottomRightMark, bottomRight)}
            </View>
          </>
        ) : (
          <ActivityIndicator color={theme.accentBright} />
        )}
      </View>

      <View style={styles.pagePicker}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageStrip}>
          {pages.map((item, itemIndex) => {
            const selected = itemIndex === selectedIndex;
            const edited = dirtyIds.has(item.id) || !!item.crop;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedIndex(itemIndex)}
                accessibilityRole="button"
                accessibilityLabel={`Crop page ${itemIndex + 1}${edited ? ", edited" : ""}`}
                accessibilityState={{ selected }}
                style={[styles.thumb, selected && styles.thumbSelected]}
              >
                <Image source={{ uri: item.uri }} style={styles.thumbImage} />
                <View style={[styles.thumbNumber, selected && styles.thumbNumberSelected]}>
                  <Text style={styles.thumbNumberText}>{itemIndex + 1}</Text>
                </View>
                {edited ? <Ionicons name="crop" size={13} color="#FFFFFF" style={styles.editedIcon} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space.md }]}>
        <Text style={styles.help}>Drag square corners. Select another page to batch crop.</Text>
        <Pressable
          onPress={() => setCrop(FULL_CROP)}
          accessibilityRole="button"
          accessibilityLabel="Reset crop"
          style={styles.resetButton}
        >
          <Ionicons name="refresh-outline" size={18} color={theme.accentBright} />
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg },
    header: { minHeight: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: theme.space.md, gap: theme.space.sm },
    headerButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
    headerCopy: { flex: 1, alignItems: "center" },
    title: { ...theme.type.title, color: theme.text },
    subtitle: { color: theme.textTertiary, fontSize: 10, marginTop: 2 },
    doneButton: { minWidth: 64, height: 42, borderRadius: theme.radius.md, alignItems: "center", justifyContent: "center", backgroundColor: theme.accent },
    doneText: { color: theme.accentText, fontSize: 13, fontWeight: "700" },
    disabled: { opacity: 0.5 },
    stage: { flex: 1, position: "relative", overflow: "hidden", backgroundColor: theme.isDark ? "#050609" : "#E9EBF0", alignItems: "center", justifyContent: "center" },
    image: { position: "absolute" },
    mask: { position: "absolute", backgroundColor: "rgba(0,0,0,0.58)" },
    cropBox: { position: "absolute", borderWidth: 2, borderColor: "#FFFFFF" },
    gridLineVertical: { position: "absolute", top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.55)" },
    gridLineHorizontal: { position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.55)" },
    handleTouch: { position: "absolute", width: 42, height: 42, alignItems: "center", justifyContent: "center" },
    handleMark: { width: 20, height: 20, borderColor: theme.accentBright },
    topLeft: { left: -21, top: -21 },
    topRight: { right: -21, top: -21 },
    bottomLeft: { left: -21, bottom: -21 },
    bottomRight: { right: -21, bottom: -21 },
    topLeftMark: { borderTopWidth: 4, borderLeftWidth: 4 },
    topRightMark: { borderTopWidth: 4, borderRightWidth: 4 },
    bottomLeftMark: { borderBottomWidth: 4, borderLeftWidth: 4 },
    bottomRightMark: { borderBottomWidth: 4, borderRightWidth: 4 },
    pagePicker: { minHeight: 82, justifyContent: "center", backgroundColor: theme.bgElevated, borderTopWidth: 1, borderTopColor: theme.border },
    pageStrip: { gap: 9, paddingHorizontal: theme.space.md, paddingVertical: 8 },
    thumb: { width: 50, height: 64, borderRadius: 7, borderWidth: 2, borderColor: "transparent", overflow: "hidden", backgroundColor: theme.surface },
    thumbSelected: { borderColor: theme.accentBright },
    thumbImage: { width: "100%", height: "100%" },
    thumbNumber: { position: "absolute", left: 3, bottom: 3, minWidth: 17, height: 17, paddingHorizontal: 3, borderRadius: 5, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,6,9,0.76)" },
    thumbNumberSelected: { backgroundColor: theme.accent },
    thumbNumberText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
    editedIcon: { position: "absolute", right: 4, top: 4, padding: 3, backgroundColor: "rgba(5,6,9,0.7)", borderRadius: 4 },
    footer: { minHeight: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: theme.space.md, paddingTop: theme.space.xs, backgroundColor: theme.bgElevated },
    help: { flex: 1, color: theme.textSecondary, fontSize: 11, lineHeight: 16, paddingRight: theme.space.sm },
    resetButton: { minWidth: 78, minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
    resetText: { color: theme.accentBright, fontSize: 13, fontWeight: "700" },
  });
}
