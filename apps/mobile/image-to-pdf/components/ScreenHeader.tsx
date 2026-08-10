import { ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppTheme, useAppTheme } from "../lib/theme";

const SIDE_WIDTH = 112;

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  backText,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  backText?: string;
  rightSlot?: ReactNode;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.wrap}>
      <View style={[styles.side, backText ? styles.sideWide : null]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={21} color={theme.text} />
            {backText ? <Text style={styles.backText}>{backText}</Text> : null}
          </Pressable>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>
        <View style={styles.rightInner}>{rightSlot}</View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 56,
    },
    side: {
      width: SIDE_WIDTH,
      flexShrink: 0,
      minHeight: 44,
      justifyContent: "center",
    },
    sideWide: {
      width: SIDE_WIDTH + 28,
    },
    backButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingRight: 4,
    },
    backText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "700",
    },
    rightInner: {
      width: "100%",
      alignItems: "flex-end",
      justifyContent: "center",
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    center: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
    },
    title: { ...theme.type.bodyStrong, color: theme.text, fontSize: 16, textAlign: "center" },
    subtitle: { color: theme.textTertiary, fontSize: 11, fontWeight: "500", textAlign: "center" },
    pressed: { backgroundColor: theme.bgElevated, opacity: 0.8 },
  });
}
