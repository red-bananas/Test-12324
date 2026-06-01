import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";
import { AnimatedScore } from "./AnimatedScore";

interface ScoreHeaderProps {
  score: number;
  best: number;
  onNewGame: () => void;
  onUndo: () => void;
  onOpenSettings: () => void;
  canUndo: boolean;
  reduceMotion: boolean;
  isNewBest: boolean;
}

export function ScoreHeader({
  score,
  best,
  onNewGame,
  onUndo,
  onOpenSettings,
  canUndo,
  reduceMotion,
  isNewBest,
}: ScoreHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text accessibilityRole="header" style={styles.title}>
            Tile Merge
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Open settings"
          accessibilityRole="button"
          onPress={onOpenSettings}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsText}>Settings</Text>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Undo last move"
          accessibilityState={{ disabled: !canUndo }}
          disabled={!canUndo}
          onPress={onUndo}
          style={[styles.button, !canUndo && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Undo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start new game"
          onPress={onNewGame}
          style={[styles.button, styles.buttonPrimary]}
        >
          <Text style={[styles.buttonText, styles.buttonPrimaryText]}>New game</Text>
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
    backgroundColor: palette.board,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  settingsText: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    backgroundColor: palette.board,
    borderRadius: 10,
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: palette.accent,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  buttonPrimaryText: {
    color: "#1c1b22",
  },
});
