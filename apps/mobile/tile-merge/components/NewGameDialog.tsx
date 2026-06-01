import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { palette } from "../game/colors";

interface NewGameDialogProps {
  visible: boolean;
  score: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function NewGameDialog({
  visible,
  score,
  onCancel,
  onConfirm,
}: NewGameDialogProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Start a new game?</Text>
          <Text style={styles.body}>
            Your current score of {score.toLocaleString()} will be lost.
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Keep playing"
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.button, styles.secondary]}
            >
              <Text style={styles.secondaryText}>Keep playing</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Confirm new game"
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.button, styles.primary]}
            >
              <Text style={styles.primaryText}>New game</Text>
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
    backgroundColor: "rgba(0,0,0,0.65)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: palette.background,
    borderRadius: 16,
    gap: 12,
    maxWidth: 340,
    padding: 20,
    width: "100%",
  },
  title: {
    color: palette.textPrimary,
    fontSize: 22,
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
  button: {
    borderRadius: 10,
    flex: 1,
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
