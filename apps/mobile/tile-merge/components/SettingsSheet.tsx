import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { palette } from "../game/colors";
import type { GameSettings } from "../game/settings";

interface SettingsSheetProps {
  visible: boolean;
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onClose: () => void;
}

function SettingRow({
  label,
  description,
  value,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor={value ? palette.accent : "#f4f3f4"}
        trackColor={{ false: "#5c5868", true: "#ff9b7a" }}
        value={value}
      />
    </View>
  );
}

export function SettingsSheet({
  visible,
  settings,
  onChange,
  onClose,
}: SettingsSheetProps) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Settings</Text>

          <SettingRow
            description="Light taps when tiles merge"
            label="Haptics"
            onValueChange={(hapticsEnabled) =>
              onChange({ ...settings, hapticsEnabled })
            }
            value={settings.hapticsEnabled}
          />
          <SettingRow
            description="Merge sounds (coming soon)"
            label="Sound effects"
            onValueChange={(soundEnabled) =>
              onChange({ ...settings, soundEnabled })
            }
            value={settings.soundEnabled}
          />
          <SettingRow
            description="Skip tile motion for accessibility"
            label="Reduce motion"
            onValueChange={(reduceMotion) =>
              onChange({ ...settings, reduceMotion })
            }
            value={settings.reduceMotion}
          />
          <SettingRow
            description="Avoid accidental restarts mid-run"
            label="Confirm new game"
            onValueChange={(confirmNewGame) =>
              onChange({ ...settings, confirmNewGame })
            }
            value={settings.confirmNewGame}
          />

          <Pressable
            accessibilityLabel="Done"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.doneButton}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  rowDescription: {
    color: palette.textMuted,
    fontSize: 13,
  },
  doneButton: {
    alignItems: "center",
    backgroundColor: palette.accent,
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 14,
  },
  doneText: {
    color: "#1c1b22",
    fontSize: 16,
    fontWeight: "800",
  },
});
