import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";
import type { GameStatus } from "../game/state";

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  best: number;
  lastRunScore: number;
  onContinue?: () => void;
  onRestart: () => void;
}

function formatDelta(score: number, lastRunScore: number): string {
  const delta = score - lastRunScore;
  if (delta > 0) {
    return `+${delta.toLocaleString()} vs last game`;
  }
  if (delta < 0) {
    return `${delta.toLocaleString()} vs last game`;
  }
  return "Matched your last game";
}

export function GameOverlay({
  status,
  score,
  best,
  lastRunScore,
  onContinue,
  onRestart,
}: GameOverlayProps) {
  if (status === "playing") {
    return null;
  }

  const title = status === "won" ? "You reached 2048!" : "Board full";
  const message =
    status === "won"
      ? "Excellent run. Keep going for a higher score or start fresh."
      : "No moves left — try again and chase a new best.";

  const isNewBest = score > 0 && score >= best;

  return (
    <View accessibilityViewIsModal style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Final score</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          <Text style={styles.delta}>{formatDelta(score, lastRunScore)}</Text>
          <Text style={styles.bestLine}>
            Best {best.toLocaleString()}
            {isNewBest ? " · New record!" : ""}
          </Text>
        </View>

        <View style={styles.actions}>
          {status === "won" && onContinue ? (
            <Pressable
              accessibilityRole="button"
              onPress={onContinue}
              style={[styles.button, styles.secondary]}
            >
              <Text style={styles.secondaryText}>Keep playing</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onRestart}
            style={[styles.button, styles.primary]}
          >
            <Text style={styles.primaryText}>Play again</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(28, 27, 34, 0.82)",
    borderRadius: 16,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    alignItems: "center",
    gap: 12,
    maxWidth: 320,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  scoreCard: {
    alignItems: "center",
    backgroundColor: palette.board,
    borderRadius: 14,
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: "100%",
  },
  scoreLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scoreValue: {
    color: palette.textPrimary,
    fontSize: 40,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  delta: {
    color: palette.accentSoft,
    fontSize: 14,
    fontWeight: "600",
  },
  bestLine: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 8,
  },
  button: {
    borderRadius: 10,
    minWidth: 130,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.board,
  },
  primaryText: {
    color: "#1c1b22",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});
