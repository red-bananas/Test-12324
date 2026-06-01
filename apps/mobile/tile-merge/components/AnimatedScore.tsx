import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { palette } from "../game/colors";

interface AnimatedScoreProps {
  label: string;
  value: number;
  reduceMotion: boolean;
  highlight?: boolean;
}

export function AnimatedScore({
  label,
  value,
  reduceMotion,
  highlight = false,
}: AnimatedScoreProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const scale = useSharedValue(1);
  const previous = useRef(value);

  useEffect(() => {
    if (value === previous.current) {
      return;
    }

    if (reduceMotion) {
      setDisplayValue(value);
      previous.current = value;
      return;
    }

    const start = previous.current;
    const delta = value - start;
    const steps = Math.min(12, Math.max(4, Math.abs(delta) > 0 ? 8 : 1));
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      const progress = step / steps;
      setDisplayValue(Math.round(start + delta * progress));
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        previous.current = value;
      }
    }, 24);

    scale.value = withSequence(
      withTiming(1.08, { duration: 90 }),
      withTiming(1, { duration: 90 }),
    );

    return () => clearInterval(timer);
  }, [value, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.box, highlight && styles.boxHighlight]}>
      <Text style={styles.label}>{label}</Text>
      <Animated.Text style={[styles.value, animatedStyle]}>
        {displayValue.toLocaleString()}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: palette.board,
    borderRadius: 10,
    flex: 1,
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  boxHighlight: {
    borderColor: palette.accent,
    borderWidth: 1,
  },
  label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  value: {
    color: palette.textPrimary,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    marginTop: 2,
  },
});
