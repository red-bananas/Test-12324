import { useEffect, useMemo, useRef, useState } from "react";
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

const THUMB_SPAN = 66;

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
  const liveIndexRef = useRef(index);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!draggingRef.current) {
      liveIndexRef.current = index;
    }
  }, [index]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          draggingRef.current && Math.abs(gesture.dx) > 2,
        onPanResponderGrant: () => {
          liveIndexRef.current = index;
          dragX.setOffset(0);
          dragX.setValue(0);
          onSelect(index);
        },
        onPanResponderMove: (_, gesture) => {
          dragX.setValue(gesture.dx);
          const from = liveIndexRef.current;
          let to = from;
          if (gesture.dx > THUMB_SPAN * 0.45 && from < pageCount - 1) {
            to = from + 1;
          } else if (gesture.dx < -THUMB_SPAN * 0.45 && from > 0) {
            to = from - 1;
          }
          if (to === from) return;

          onReorder(from, to);
          liveIndexRef.current = to;
          const shift = (to - from) * THUMB_SPAN;
          dragX.setOffset(gesture.dx - shift);
          dragX.setValue(0);
        },
        onPanResponderRelease: () => {
          dragX.flattenOffset();
          dragX.setValue(0);
          draggingRef.current = false;
          setDragging(false);
        },
        onPanResponderTerminate: () => {
          dragX.flattenOffset();
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
          liveIndexRef.current = index;
          setDragging(true);
          onSelect(index);
        }}
        delayLongPress={120}
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
          <Text style={[styles.index, selected && styles.indexSelected]}>{index + 1}</Text>
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
  onAddPages,
}: {
  pages: PdfPage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddPages?: () => void;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const offset = Math.max(0, selectedIndex * THUMB_SPAN - 80);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [selectedIndex]);

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Text style={styles.hint}>Hold and drag a page to reorder</Text>
        {onAddPages ? (
          <Pressable
            onPress={onAddPages}
            accessibilityRole="button"
            accessibilityLabel="Add more photos"
            style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
          >
            <Ionicons name="add-circle-outline" size={18} color={theme.accentBright} />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
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
    hint: { color: theme.textTertiary, fontSize: 11, fontWeight: "500", flex: 1, paddingRight: theme.space.sm },
    addButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 4,
    },
    addText: { color: theme.accentBright, fontSize: 12, fontWeight: "700" },
    addPressed: { opacity: 0.65 },
    strip: { gap: theme.space.sm, paddingVertical: 5, paddingHorizontal: 2 },
    dragWrap: { zIndex: 1 },
    dragging: { zIndex: 10, elevation: 8, opacity: 0.94 },
    thumb: {
      width: 58,
      height: 74,
      borderRadius: theme.radius.sm,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.bgElevated,
    },
    thumbSelected: { borderColor: theme.accent, ...theme.shadow.accent },
    image: { width: "100%", height: "100%" },
    indexBadge: {
      position: "absolute",
      bottom: 4,
      left: 4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: theme.surfaceOverlay,
      alignItems: "center",
      justifyContent: "center",
    },
    indexBadgeSelected: { backgroundColor: theme.accent },
    index: { color: theme.textSecondary, fontSize: 9, fontWeight: "800" },
    indexSelected: { color: theme.accentText },
    pressed: { opacity: 0.72 },
  });
}