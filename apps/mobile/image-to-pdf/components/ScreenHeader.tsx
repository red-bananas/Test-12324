import { ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppTheme, useAppTheme } from "../lib/theme";

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={21} color={theme.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>{rightSlot}</View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 56,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    center: { flex: 1, alignItems: "center", gap: 1 },
    right: { width: 72, minHeight: 44, alignItems: "flex-end", justifyContent: "center" },
    title: { ...theme.type.bodyStrong, color: theme.text, fontSize: 16 },
    subtitle: { color: theme.textTertiary, fontSize: 11, fontWeight: "500" },
    pressed: { backgroundColor: theme.bgElevated, opacity: 0.8 },
  });
}
