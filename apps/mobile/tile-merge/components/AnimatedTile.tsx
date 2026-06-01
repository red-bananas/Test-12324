import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { palette, tileStyle } from "../game/colors";
import type { DisplayTile } from "../game/tiles";

const SLIDE_MS = 120;
const MERGE_MS = 80;
const SPAWN_MS = 150;

interface AnimatedTileProps {
  tile: DisplayTile;
  cellSize: number;
  gap: number;
  reduceMotion: boolean;
}

export function AnimatedTile({
  tile,
  cellSize,
  gap,
  reduceMotion,
}: AnimatedTileProps) {
  const x = useSharedValue(gap + tile.col * (cellSize + gap));
  const y = useSharedValue(gap + tile.row * (cellSize + gap));
  const scale = useSharedValue(tile.isNew ? 0.5 : 1);
  const opacity = useSharedValue(tile.isNew ? 0 : 1);

  useEffect(() => {
    const targetX = gap + tile.col * (cellSize + gap);
    const targetY = gap + tile.row * (cellSize + gap);

    if (reduceMotion) {
      x.value = targetX;
      y.value = targetY;
      scale.value = 1;
      opacity.value = 1;
      return;
    }

    x.value = withTiming(targetX, { duration: SLIDE_MS });
    y.value = withTiming(targetY, { duration: SLIDE_MS });

    if (tile.isNew) {
      scale.value = withTiming(1, { duration: SPAWN_MS });
      opacity.value = withTiming(1, { duration: SPAWN_MS });
    } else if (tile.merged) {
      scale.value = withSequence(
        withTiming(1.12, { duration: MERGE_MS }),
        withTiming(1, { duration: MERGE_MS }),
      );
    }
  }, [tile.row, tile.col, tile.value, tile.isNew, tile.merged, cellSize, gap, reduceMotion, opacity, scale, x, y]);

  const colors = tileStyle(tile.value);
  const fontSize = tile.value >= 1024 ? 22 : tile.value >= 128 ? 26 : 30;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          backgroundColor: colors.bg,
          height: cellSize,
          width: cellSize,
        },
        tile.value >= 128 && styles.tileGlow,
        animatedStyle,
      ]}
    >
      <Text style={[styles.tileText, { color: colors.text, fontSize }]}>
        {tile.value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    borderRadius: 10,
    elevation: 3,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
  },
  tileGlow: {
    shadowColor: palette.accentSoft,
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  tileText: {
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
  },
});
