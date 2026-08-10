import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";
import { DISPLAY_NAME } from "../game/monetization";
import type { UndoButtonState } from "../game/undoUi";
import { AnimatedScore } from "./AnimatedScore";
import { UndoButton } from "./UndoButton";

interface ScoreHeaderProps {
  score: number;
  best: number;
  onNewGame: () => void;
  onUndoPress: () => void;
  onOpenSettings: () => void;
  undoState: UndoButtonState;
  undoPending: boolean;
  reduceMotion: boolean;
  isNewBest: boolean;
}

export function ScoreHeader({
  score,
  best,
  onNewGame,
  onUndoPress,
  onOpenSettings,
  undoState,
  undoPending,
  reduceMotion,
  isNewBest,
}: ScoreHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text accessibilityRole="header" style={styles.title}>
          {DISPLAY_NAME}
        </Text>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onOpenSettings}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsPressed]}
        >
          <Ionicons color={palette.textMuted} name="settings-outline" size={22} />
        </Pressable>
      </View>

      <View style={styles.scoreRow}>
        <AnimatedScore
          highlight={isNewBest}
          label="SCORE"
          reduceMotion={reduceMotion}
          value={score}
        />
        <AnimatedScore label="BEST" reduceMotion={reduceMotion} value={best} />
      </View>

      <View style={styles.actions}>
        <UndoButton onPress={onUndoPress} pending={undoPending} state={undoState} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start new game"
          onPress={onNewGame}
          style={({ pressed }) => [
            styles.newGameButton,
            pressed && styles.newGamePressed,
          ]}
        >
          <FontAwesome color="#1c1b22" name="refresh" size={18} />
          <Text style={styles.newGameText}>New game</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 16,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: palette.board,
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  settingsPressed: {
    opacity: 0.85,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  newGameButton: {
    alignItems: "center",
    backgroundColor: palette.accent,
    borderRadius: 12,
    flex: 1.15,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  newGamePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  newGameText: {
    color: "#1c1b22",
    fontSize: 15,
    fontWeight: "800",
  },
});
