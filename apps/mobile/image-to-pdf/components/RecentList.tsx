import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatRecentMeta } from "../lib/recents";
import { AppTheme, useAppTheme } from "../lib/theme";
import type { RecentPdf } from "../lib/types";

export type RecentPdfAction = "open" | "share" | "showInFiles" | "saveAs";

type RecentListProps = {
  items: RecentPdf[];
  onPress: (item: RecentPdf) => void;
  onMenuAction: (item: RecentPdf, action: RecentPdfAction) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function RecentList({ items, onPress, onMenuAction, style, contentContainerStyle }: RecentListProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [menuItem, setMenuItem] = useState<RecentPdf | null>(null);

  const closeMenu = () => setMenuItem(null);

  const chooseAction = (action: RecentPdfAction) => {
    if (!menuItem) return;
    const item = menuItem;
    closeMenu();
    onMenuAction(item, action);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.empty, style]}>
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
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={style}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              onPress={() => onPress(item)}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}`}
              style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
            >
              <View style={styles.icon}>
                <Ionicons name="document-text-outline" size={21} color={theme.accentBright} />
              </View>
              <View style={styles.meta}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.detail} numberOfLines={1}>
                  {formatRecentMeta(item)}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setMenuItem(item)}
              accessibilityRole="button"
              accessibilityLabel={`More options for ${item.name}`}
              hitSlop={8}
              style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color={theme.textTertiary} />
            </Pressable>
          </View>
        )}
      />

      <Modal visible={menuItem !== null} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.menuBackdrop}>
          <Pressable style={styles.menuDismiss} onPress={closeMenu} accessibilityLabel="Close menu" />
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + theme.space.md }]}>
            <Text style={styles.menuTitle} numberOfLines={1}>{menuItem?.name}</Text>
            <Pressable
              onPress={() => chooseAction("open")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.menuOption, pressed && styles.pressed]}
            >
              <Ionicons name="open-outline" size={20} color={theme.text} />
              <Text style={styles.menuOptionText}>Open</Text>
            </Pressable>
            <Pressable
              onPress={() => chooseAction("share")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.menuOption, pressed && styles.pressed]}
            >
              <Ionicons name="share-outline" size={20} color={theme.text} />
              <Text style={styles.menuOptionText}>Share</Text>
            </Pressable>
            <Pressable
              onPress={() => chooseAction("showInFiles")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.menuOption, pressed && styles.pressed]}
            >
              <Ionicons name="folder-open-outline" size={20} color={theme.text} />
              <Text style={styles.menuOptionText}>Show in Files</Text>
            </Pressable>
            <Pressable
              onPress={() => chooseAction("saveAs")}
              accessibilityRole="button"
              style={({ pressed }) => [styles.menuOption, pressed && styles.pressed]}
            >
              <Ionicons name="save-outline" size={20} color={theme.text} />
              <Text style={styles.menuOptionText}>Save as</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.xs,
    },
    rowMain: {
      flex: 1,
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
    meta: { flex: 1, gap: 2 },
    name: { ...theme.type.caption, color: theme.text, fontWeight: "700" },
    detail: { color: theme.textTertiary, fontSize: 11 },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    menuBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    menuDismiss: {
      ...StyleSheet.absoluteFillObject,
    },
    menuSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.border,
      paddingTop: theme.space.md,
      paddingHorizontal: theme.space.md,
      gap: 4,
    },
    menuTitle: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: theme.space.xs,
      paddingHorizontal: theme.space.xs,
    },
    menuOption: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
      paddingHorizontal: theme.space.sm,
      borderRadius: theme.radius.md,
    },
    menuOptionText: { color: theme.text, fontSize: 15, fontWeight: "600" },
    pressed: { opacity: 0.68 },
  });
}
