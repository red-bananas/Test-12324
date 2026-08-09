import { ReactNode, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppTheme, useAppTheme } from "../lib/theme";

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OptionPill({
  label,
  sublabel,
  selected,
  onPress,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={sublabel ? `${label}, ${sublabel}` : label}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {sublabel ? <Text style={styles.optionSublabel}>{sublabel}</Text> : null}
      {selected ? (
        <View style={styles.optionCheck}>
          <Ionicons name="checkmark" size={12} color={theme.accentText} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  busy,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || busy;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!busy }}
      style={({ pressed }) => [
        styles.primary,
        pressed && !isDisabled && styles.primaryPressed,
        isDisabled && styles.disabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={theme.accentText} />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={styles.primaryText}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.buttonContent}>
        {icon}
        <Text style={styles.secondaryText}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function IconToolButton({
  icon,
  label,
  onPress,
  danger,
  active,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const color = danger ? theme.danger : theme.accentBright;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [styles.tool, active && styles.toolActive, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={21} color={color} />
      <Text style={[styles.toolLabel, danger && { color: theme.danger }, active && styles.toolLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      padding: theme.space.md,
      gap: theme.space.md,
    },
    segmented: {
      flexDirection: "row",
      backgroundColor: theme.bgElevated,
      borderRadius: theme.radius.md,
      padding: 4,
      gap: 4,
    },
    segment: {
      flex: 1,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.space.sm,
    },
    segmentSelected: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...theme.shadow.card,
    },
    segmentText: { ...theme.type.caption, color: theme.textTertiary },
    segmentTextSelected: { color: theme.text, fontWeight: "700" },
    option: {
      flex: 1,
      minWidth: 88,
      minHeight: 74,
      padding: theme.space.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: "center",
      gap: 2,
    },
    optionSelected: { backgroundColor: theme.accentMuted, borderColor: theme.accent },
    optionLabel: { ...theme.type.caption, color: theme.text, fontWeight: "700" },
    optionLabelSelected: { color: theme.accentBright },
    optionSublabel: { color: theme.textTertiary, fontSize: 11 },
    optionCheck: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    primary: {
      backgroundColor: theme.accent,
      borderRadius: theme.radius.lg,
      minHeight: 56,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.space.lg,
      ...theme.shadow.accent,
    },
    primaryPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
    secondary: {
      minHeight: 52,
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonContent: { flexDirection: "row", alignItems: "center", gap: theme.space.sm },
    primaryText: { color: theme.accentText, fontSize: 16, fontWeight: "700" },
    secondaryText: { ...theme.type.bodyStrong, color: theme.text, fontSize: 15 },
    tool: {
      flex: 1,
      minHeight: 58,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: "transparent",
    },
    toolActive: {
      backgroundColor: theme.accentMuted,
      borderColor: theme.accentBright,
    },
    toolLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: "600" },
    toolLabelActive: { color: theme.text },
    pressed: { opacity: 0.72 },
    disabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
  });
}
