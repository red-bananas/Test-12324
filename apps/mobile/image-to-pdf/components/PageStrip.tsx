import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { PdfPage } from "../lib/types";

const THUMB_SPAN = 68;

function DraggablePage({
  page,
  index,
  pageCount,
  selected,
  onSelect,
  onReorder,
  styles,
}: {
  page: PdfPage;
  index: number;
  pageCount: number;
  selected: boolean;
  onSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const dragX = useRef(new Animated.Value(0)).current;
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        draggingRef.current && Math.abs(gesture.dx) > 2,
      onPanResponderGrant: () => onSelect(index),
      onPanResponderMove: (_, gesture) => dragX.setValue(gesture.dx),
      onPanResponderRelease: (_, gesture) => {
        const offset = Math.round(gesture.dx / THUMB_SPAN);
        const target = Math.min(pageCount - 1, Math.max(0, index + offset));
        if (target !== index) onReorder(index, target);
        dragX.setValue(0);
        draggingRef.current = false;
        setDragging(false);
      },
      onPanResponderTerminate: () => {
        dragX.setValue(0);
        draggingRef.current = false;
        setDragging(false);
      },
    }),
    [dragX, index, onReorder, onSelect, pageCount],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.dragWrap, dragging && styles.dragging, { transform: [{ translateX: dragX }] }]}
    >
      <Pressable
        onPress={() => onSelect(index)}
        onLongPress={() => {
          draggingRef.current = true;
          setDragging(true);
          onSelect(index);
        }}
        delayLongPress={180}
        accessibilityRole="button"
        accessibilityLabel={`Page ${index + 1}. Hold and drag to reorder.`}
        accessibilityState={{ selected }}
        accessibilityActions={[
          ...(index > 0 ? [{ name: "decrement" as const, label: "Move page left" }] : []),
          ...(index < pageCount - 1 ? [{ name: "increment" as const, label: "Move page right" }] : []),
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "decrement") onReorder(index, index - 1);
          if (event.nativeEvent.actionName === "increment") onReorder(index, index + 1);
        }}
        style={({ pressed }) => [
          styles.thumb,
          selected && styles.thumbSelected,
          pressed && !dragging && styles.pressed,
        ]}
      >
        <Image source={{ uri: page.uri }} style={styles.image} />
        <View style={[styles.indexBadge, selected && styles.indexBadgeSelected]}>
          <Text style={styles.index}>{index + 1}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function PageStrip({
  pages,
  selectedIndex,
  onSelect,
  onReorder,
}: {
  pages: PdfPage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.hint}>Hold and drag a page to reorder</Text>
        <Ionicons name="reorder-three-outline" size={18} color={theme.textTertiary} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {pages.map((page, index) => (
          <DraggablePage
            key={page.id}
            page={page}
            index={index}
            pageCount={pages.length}
            selected={index === selectedIndex}
            onSelect={onSelect}
            onReorder={onReorder}
            styles={styles}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: { gap: theme.space.sm },
    heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    hint: { color: theme.textTertiary, fontSize: 11, fontWeight: "500" },
    strip: { gap: theme.space.sm, paddingVertical: 5, paddingHorizontal: 2 },
    dragWrap: { zIndex: 1 },
    dragging: { zIndex: 10, elevation: 8, opacity: 0.92 },
    thumb: { width: 58, height: 74, borderRadius: theme.radius.sm, overflow: "hidden", borderWidth: 2, borderColor: "transparent", backgroundColor: theme.bgElevated },
    thumbSelected: { borderColor: theme.accent, ...theme.shadow.accent },
    image: { width: "100%", height: "100%" },
    indexBadge: { position: "absolute", bottom: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.surfaceOverlay, alignItems: "center", justifyContent: "center" },
    indexBadgeSelected: { backgroundColor: theme.accent },
    index: { color: theme.accentText, fontSize: 9, fontWeight: "800" },
    pressed: { opacity: 0.72 },
  });
}
