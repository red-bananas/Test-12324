import Entypo from "@expo/vector-icons/Entypo";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";
import type { UndoButtonState } from "../game/undoUi";

interface UndoButtonProps {
  state: UndoButtonState;
  pending: boolean;
  onPress: () => void;
}

function accessibilityLabelFor(state: UndoButtonState, pending: boolean): string {
  if (pending) {
    return "Loading ad for undo";
  }
  if (state.mode === "free") {
    if (!state.enabled) {
      return `Undo, ${state.freeLeft} available after your first move`;
    }
    return state.freeLeft === 1
      ? "Undo last move"
      : `Undo last move, ${state.freeLeft} free undos left`;
  }
  if (!state.enabled) {
    return "Watch ad to undo, make a move first";
  }
  if (state.watchAdBadge) {
    return `Watch ad to undo up to ${state.watchAdBadge} moves and resume`;
  }
  return "Watch ad to undo";
}

function overlayFor(state: UndoButtonState): {
  count?: number;
  showAdIcon: boolean;
} {
  if (state.mode === "free") {
    return { count: state.freeLeft, showAdIcon: false };
  }
  if (state.watchAdBadge) {
    return { count: state.watchAdBadge, showAdIcon: false };
  }
  if (state.mode === "watchAd") {
    return { showAdIcon: true };
  }
  return { showAdIcon: false };
}

function UndoIconWithOverlay({
  color,
  count,
  showAdIcon,
  muted,
  watchAd,
}: {
  color: string;
  count?: number;
  showAdIcon: boolean;
  muted?: boolean;
  watchAd?: boolean;
}) {
  const showCount = count !== undefined;
  const showOverlay = showCount || showAdIcon;

  return (
    <View style={styles.iconStack}>
      <Ionicons color={color} name="arrow-undo" size={20} />
      {showOverlay ? (
        <View
          style={[
            styles.overlay,
            showCount && styles.countOverlay,
            showAdIcon && styles.adOverlay,
            muted && styles.overlayMuted,
          ]}
        >
          {showCount ? (
            <Text style={[styles.countOverlayText, muted && styles.countOverlayTextMuted]}>
              {count}
            </Text>
          ) : (
            <Entypo
              color={watchAd && !muted ? palette.textPrimary : palette.textMuted}
              name="youtube"
              size={9}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

export function UndoButton({ state, pending, onPress }: UndoButtonProps) {
  const isWatchAd = state.mode === "watchAd";
  const enabled = state.enabled && !pending;
  const iconColor = enabled
    ? isWatchAd
      ? "#1c1b22"
      : palette.textPrimary
    : palette.textMuted;
  const overlay = overlayFor(state);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabelFor(state, pending)}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isWatchAd && styles.buttonWatchAd,
        !enabled && styles.buttonDisabled,
        pressed && enabled && styles.buttonPressed,
      ]}
    >
      <View style={styles.inner}>
        {pending ? (
          <ActivityIndicator color={isWatchAd ? "#1c1b22" : palette.textPrimary} size="small" />
        ) : null}
        <UndoIconWithOverlay
          color={iconColor}
          count={overlay.count}
          muted={!enabled}
          showAdIcon={overlay.showAdIcon}
          watchAd={isWatchAd}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            isWatchAd && styles.labelWatchAd,
            !enabled && styles.labelDisabled,
          ]}
        >
          Undo
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: palette.board,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonWatchAd: {
    backgroundColor: palette.accentSoft,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  inner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  iconStack: {
    height: 24,
    justifyContent: "center",
    marginRight: 2,
    width: 24,
  },
  countOverlay: {
    backgroundColor: palette.accent,
    minWidth: 14,
    paddingHorizontal: 2,
  },
  adOverlay: {
    backgroundColor: "#1c1b22",
    width: 14,
  },
  overlay: {
    alignItems: "center",
    borderRadius: 7,
    bottom: -2,
    height: 14,
    justifyContent: "center",
    position: "absolute",
    right: -6,
  },
  overlayMuted: {
    backgroundColor: palette.cellEmpty,
  },
  countOverlayText: {
    color: "#1c1b22",
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 10,
  },
  countOverlayTextMuted: {
    color: palette.textMuted,
  },
  label: {
    color: palette.textPrimary,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  labelWatchAd: {
    color: "#1c1b22",
    fontSize: 14,
  },
  labelDisabled: {
    color: palette.textMuted,
  },
});
