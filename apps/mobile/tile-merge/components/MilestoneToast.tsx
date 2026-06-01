import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { milestoneMessage } from "../game/milestones";
import { palette } from "../game/colors";

interface MilestoneToastProps {
  milestone: number | null;
  onDone: () => void;
  reduceMotion: boolean;
}

export function MilestoneToast({
  milestone,
  onDone,
  reduceMotion,
}: MilestoneToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(reduceMotion ? 0 : 12);

  useEffect(() => {
    if (!milestone) {
      return;
    }

    opacity.value = withTiming(1, { duration: reduceMotion ? 0 : 180 });
    translateY.value = withTiming(0, { duration: reduceMotion ? 0 : 180 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: reduceMotion ? 0 : 220 });
      setTimeout(onDone, reduceMotion ? 0 : 220);
    }, 1400);

    return () => clearTimeout(timer);
  }, [milestone, onDone, opacity, reduceMotion, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!milestone) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      <View style={styles.toast}>
        <Text style={styles.value}>{milestone}</Text>
        <Text style={styles.message}>{milestoneMessage(milestone)}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 12,
    zIndex: 20,
  },
  toast: {
    alignItems: "center",
    backgroundColor: palette.board,
    borderColor: palette.accent,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  value: {
    color: palette.accentSoft,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
  message: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
});
