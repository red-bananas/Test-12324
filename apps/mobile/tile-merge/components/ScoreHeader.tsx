import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";
import { monetizationConfig } from "../game/monetization";
import { AnimatedScore } from "./AnimatedScore";

interface ScoreHeaderProps {
  score: number;
  best: number;
  onNewGame: () => void;
  onUndo: () => void;
  onRewardedUndo: () => void;
  onOpenSettings: () => void;
  canUndo: boolean;
  canRewardedUndo: boolean;
  rewardedUndoPending: boolean;
  freeUndosLeft: number;
  reduceMotion: boolean;
  isNewBest: boolean;
}

export function ScoreHeader({
  score,
  best,
  onNewGame,
  onUndo,
  onRewardedUndo,
  onOpenSettings,
  canUndo,
  canRewardedUndo,
  rewardedUndoPending,
  freeUndosLeft,
  reduceMotion,
  isNewBest,
}: ScoreHeaderProps) {
  const undoLabel =
    monetizationConfig.phase === 1
      ? "Bonus undo"
      : "Watch ad → Undo";

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text accessibilityRole="header" style={styles.title}>
            Tile Merge
          </Text>
          <Text style={styles.subtitle}>
            {freeUndosLeft} free undo{freeUndosLeft === 1 ? "" : "s"} left
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
        {canRewardedUndo ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={undoLabel}
            accessibilityState={{ disabled: rewardedUndoPending }}
            disabled={rewardedUndoPending}
            onPress={onRewardedUndo}
            style={[styles.button, styles.buttonRewarded]}
          >
            <Text style={styles.buttonRewardedText}>
              {rewardedUndoPending ? "Loading…" : undoLabel}
            </Text>
          </Pressable>
        ) : (
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
        )}
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
  subtitle: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  buttonPrimary: {
    backgroundColor: palette.accent,
  },
  buttonRewarded: {
    backgroundColor: palette.accentSoft,
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
  buttonRewardedText: {
    color: "#1c1b22",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});
