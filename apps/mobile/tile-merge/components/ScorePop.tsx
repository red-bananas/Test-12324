import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { palette } from "../game/colors";

interface ScorePopProps {
  points: number;
  token: number;
  reduceMotion: boolean;
}

export function ScorePop({ points, token, reduceMotion }: ScorePopProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (token === 0 || points <= 0) {
      return;
    }

    opacity.value = 1;
    translateY.value = 0;
    opacity.value = withTiming(0, { duration: reduceMotion ? 0 : 700 });
    translateY.value = withTiming(-28, { duration: reduceMotion ? 0 : 700 });
  }, [token, points, opacity, translateY, reduceMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (points <= 0) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, style]}>
      <Text style={styles.text}>+{points}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 24,
    top: 8,
    zIndex: 15,
  },
  text: {
    color: palette.accentSoft,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
});
