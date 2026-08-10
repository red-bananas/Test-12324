import { useEffect } from "react";
import {
  BackHandler,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { palette } from "../game/colors";
import {
  APP_VERSION,
  DISPLAY_NAME,
  monetizationConfig,
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
} from "../game/monetization";
import { soundEffectsAvailable } from "../game/sounds";
import type { PlayerStats } from "../game/stats";
import { todayKey } from "../game/stats";
import type { GameSettings } from "../game/settings";

interface SettingsSheetProps {
  visible: boolean;
  settings: GameSettings;
  stats: PlayerStats;
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
  stats,
  onChange,
  onClose,
}: SettingsSheetProps) {
  const phaseLabel =
    monetizationConfig.phase === 1
      ? "Free launch — no ads"
      : "Optional rewarded ads for bonus undos";

  const dailyBestToday =
    stats.dailyBestDate === todayKey() ? stats.dailyBest : 0;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [onClose, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <Text style={styles.title}>Settings</Text>

          <SettingRow
            description="Light taps when tiles merge"
            label="Haptics"
            onValueChange={(hapticsEnabled) =>
              onChange({ ...settings, hapticsEnabled })
            }
            value={settings.hapticsEnabled}
          />
          {soundEffectsAvailable ? (
            <SettingRow
              description="Merge sounds"
              label="Sound effects"
              onValueChange={(soundEnabled) =>
                onChange({ ...settings, soundEnabled })
              }
              value={settings.soundEnabled}
            />
          ) : null}
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
            <Text style={styles.sectionTitle}>Your stats</Text>
            <Text style={styles.aboutLine}>
              Games played: {stats.gamesPlayed.toLocaleString()}
            </Text>
            <Text style={styles.aboutLine}>
              Total merges: {stats.totalMerges.toLocaleString()}
            </Text>
            <Text style={styles.aboutLine}>
              Highest tile: {stats.highestTileEver || "—"}
            </Text>
            <Text style={styles.aboutLine}>
              Today&apos;s best: {dailyBestToday > 0 ? dailyBestToday.toLocaleString() : "—"}
            </Text>
            <Text style={styles.aboutLine}>
              Streak: {stats.currentStreak} day{stats.currentStreak === 1 ? "" : "s"}
              {stats.longestStreak > stats.currentStreak
                ? ` (best ${stats.longestStreak})`
                : ""}
            </Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutLine}>
              {DISPLAY_NAME} v{APP_VERSION}
            </Text>
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
          </ScrollView>
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
    maxHeight: "88%",
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetContent: {
    gap: 8,
    paddingBottom: 8,
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
