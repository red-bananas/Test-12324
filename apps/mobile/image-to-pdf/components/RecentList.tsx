import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatFileSize } from "../lib/fs";
import { formatRecentDate } from "../lib/recents";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { RecentPdf } from "../lib/types";

export function RecentList({ items, onPress }: { items: RecentPdf[]; onPress: (item: RecentPdf) => void }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="folder-open-outline" size={22} color={theme.textTertiary} />
        </View>
        <View style={styles.emptyCopy}>
          <Text style={styles.emptyTitle}>No PDFs yet</Text>
          <Text style={styles.emptyText}>Your exported PDFs appear here.</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={items.slice(0, 5)}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`Share ${item.name}`}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.icon}>
            <Ionicons name="document-text-outline" size={21} color={theme.accentBright} />
          </View>
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.detail} numberOfLines={1}>
              {formatFileSize(item.sizeBytes)} · {item.pageCount} {item.pageCount === 1 ? "page" : "pages"} · {formatRecentDate(item.createdAt)}
            </Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.textTertiary} />
        </Pressable>
      )}
    />
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    empty: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      paddingVertical: theme.space.md,
    },
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.bgElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyCopy: { flex: 1, gap: 3 },
    emptyTitle: { ...theme.type.caption, color: theme.textSecondary, fontWeight: "700" },
    emptyText: { color: theme.textTertiary, fontSize: 12 },
    separator: { height: 1, backgroundColor: theme.border },
    row: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      paddingVertical: theme.space.sm,
    },
    icon: {
      width: 42,
      height: 48,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    meta: { flex: 1, gap: 4 },
    name: { ...theme.type.caption, color: theme.text, fontWeight: "700" },
    detail: { color: theme.textTertiary, fontSize: 11 },
    pressed: { opacity: 0.68 },
  });
}
