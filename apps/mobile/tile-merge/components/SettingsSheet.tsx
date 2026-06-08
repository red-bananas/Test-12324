import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { palette } from "../game/colors";
import {
  APP_VERSION,
  monetizationConfig,
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
} from "../game/monetization";
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

function LinkRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={styles.linkRow}
    >
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

export function SettingsSheet({
  visible,
  settings,
  onChange,
  onClose,
}: SettingsSheetProps) {
  const phaseLabel =
    monetizationConfig.phase === 1
      ? "Free launch — no ads"
      : "Ads enabled";

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
            description="Merge sounds ship in a future update"
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

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutLine}>Tile Merge v{APP_VERSION}</Text>
            <Text style={styles.aboutLine}>{phaseLabel}</Text>
            <Text style={styles.aboutLine}>
              Offline puzzle. Scores saved on device only.
            </Text>
            <LinkRow
              label="Privacy policy"
              onPress={() => {
                void Linking.openURL(PRIVACY_POLICY_URL);
              }}
            />
            {SUPPORT_URL ? (
              <LinkRow
                label="Support the developer"
                onPress={() => {
                  void Linking.openURL(SUPPORT_URL);
                }}
              />
            ) : null}
          </View>

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
  aboutSection: {
    borderTopColor: palette.board,
    borderTopWidth: 1,
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  aboutLine: {
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  linkRow: {
    paddingVertical: 6,
  },
  linkText: {
    color: palette.accentSoft,
    fontSize: 14,
    fontWeight: "600",
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
