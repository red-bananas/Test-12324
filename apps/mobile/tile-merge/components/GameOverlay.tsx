import { ActivityIndicator, Pressable, Share, StyleSheet, Text, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { Ionicons } from "@expo/vector-icons";
import { palette } from "../game/colors";
import { DISPLAY_NAME, PLAY_STORE_URL } from "../game/monetization";
import type { GameStatus } from "../game/state";

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  best: number;
  lastRunScore: number;
  highestTile: number;
  moveCount: number;
  resumeUndosRemaining?: number;
  resumeUndoPending?: boolean;
  onContinue?: () => void;
  onResumeUndo?: () => void;
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

function buildShareMessage(
  score: number,
  best: number,
  highestTile: number,
  status: GameStatus,
): string {
  const headline =
    status === "won"
      ? `I reached 2048 in ${DISPLAY_NAME} with ${score.toLocaleString()} points!`
      : `I scored ${score.toLocaleString()} in ${DISPLAY_NAME}!`;
  return `${headline}\nHighest tile: ${highestTile}\nBest: ${best.toLocaleString()}\n${PLAY_STORE_URL}`;
}

export function GameOverlay({
  status,
  score,
  best,
  lastRunScore,
  highestTile,
  moveCount,
  resumeUndosRemaining = 0,
  resumeUndoPending = false,
  onContinue,
  onResumeUndo,
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

  const isNewBest = score > 0 && score > lastRunScore && score >= best;

  const handleShare = () => {
    void Share.share({
      message: buildShareMessage(score, best, highestTile, status),
      title: `${DISPLAY_NAME} score`,
    });
  };

  const canResume =
    status === "lost" && resumeUndosRemaining > 0 && Boolean(onResumeUndo);

  return (
    <View accessibilityViewIsModal style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.scoreCard}>
          {isNewBest ? (
            <Text style={styles.newBestBanner}>New personal best!</Text>
          ) : null}
          <Text style={styles.scoreLabel}>Final score</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          <Text style={styles.delta}>{formatDelta(score, lastRunScore)}</Text>
          <Text style={styles.statsLine}>
            Highest tile {highestTile} · {moveCount} moves
          </Text>
          <Text style={styles.bestLine}>
            Best {best.toLocaleString()}
            {isNewBest ? " · Record!" : ""}
          </Text>
        </View>

        <View style={styles.actions}>
          {canResume ? (
            <Pressable
              accessibilityLabel={`Watch ad to undo ${resumeUndosRemaining} moves and resume`}
              accessibilityRole="button"
              accessibilityState={{ disabled: resumeUndoPending }}
              disabled={resumeUndoPending}
              onPress={onResumeUndo}
              style={[styles.button, styles.resume]}
            >
              {resumeUndoPending ? (
                <ActivityIndicator color="#1c1b22" size="small" />
              ) : (
                <View style={styles.resumeContent}>
                  <View style={styles.resumeIconStack}>
                    <Ionicons color="#1c1b22" name="arrow-undo" size={18} />
                    <View style={styles.resumeCountOverlay}>
                      <Text style={styles.resumeCountText}>{resumeUndosRemaining}</Text>
                    </View>
                  </View>
                  <Entypo color="#1c1b22" name="youtube" size={14} />
                  <Text style={styles.resumeText}>Undo</Text>
                </View>
              )}
            </Pressable>
          ) : null}
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
            onPress={handleShare}
            style={[styles.button, styles.secondary]}
          >
            <Text style={styles.secondaryText}>Share score</Text>
          </Pressable>
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
    backgroundColor: "rgba(28, 27, 34, 0.5)",
    justifyContent: "center",
    padding: 16,
    zIndex: 20,
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
  newBestBanner: {
    color: palette.accent,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
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
  statsLine: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
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
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: palette.accent,
  },
  secondary: {
    backgroundColor: palette.board,
  },
  resume: {
    backgroundColor: palette.accentSoft,
    minWidth: 200,
  },
  resumeContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  resumeIconStack: {
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  resumeCountOverlay: {
    alignItems: "center",
    backgroundColor: "#1c1b22",
    borderRadius: 6,
    bottom: -2,
    height: 14,
    justifyContent: "center",
    minWidth: 14,
    paddingHorizontal: 2,
    position: "absolute",
    right: -6,
  },
  resumeCountText: {
    color: palette.textPrimary,
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 10,
  },
  resumeText: {
    color: "#1c1b22",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
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
