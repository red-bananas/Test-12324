import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";

const STEPS = [
  {
    title: "Swipe to move",
    body: "Swipe anywhere on the board to slide all tiles in that direction.",
  },
  {
    title: "Merge matching tiles",
    body: "When two tiles with the same number touch, they combine into one.",
  },
  {
    title: "Reach 2048",
    body: "Keep merging to build bigger tiles and beat your best score.",
  },
];

interface OnboardingOverlayProps {
  visible: boolean;
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingOverlay({
  visible,
  step,
  onNext,
  onSkip,
}: OnboardingOverlayProps) {
  const current = STEPS[step] ?? STEPS[0];
  const isLast = step >= STEPS.length - 1;

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.step}>
            {step + 1} / {STEPS.length}
          </Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Skip tutorial"
              accessibilityRole="button"
              onPress={onSkip}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={isLast ? "Start playing" : "Next tutorial step"}
              accessibilityRole="button"
              onPress={onNext}
              style={styles.nextButton}
            >
              <Text style={styles.nextText}>{isLast ? "Start playing" : "Next"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.72)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: palette.background,
    borderRadius: 18,
    gap: 12,
    maxWidth: 360,
    padding: 22,
    width: "100%",
  },
  step: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  body: {
    color: palette.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
  },
  skipText: {
    color: palette.textMuted,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: palette.accent,
    borderRadius: 10,
    flex: 1,
    paddingVertical: 12,
  },
  nextText: {
    color: "#1c1b22",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
