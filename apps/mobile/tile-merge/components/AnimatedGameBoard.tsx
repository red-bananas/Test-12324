import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { GRID_SIZE } from "../game/state";
import { palette } from "../game/colors";
import type { DisplayTile } from "../game/tiles";
import { AnimatedTile } from "./AnimatedTile";

interface AnimatedGameBoardProps {
  tiles: DisplayTile[];
  size: number;
  reduceMotion: boolean;
  shakeToken: number;
}

export function AnimatedGameBoard({
  tiles,
  size,
  reduceMotion,
  shakeToken,
}: AnimatedGameBoardProps) {
  const gap = 8;
  const cellSize = (size - gap * (GRID_SIZE + 1)) / GRID_SIZE;
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (shakeToken === 0 || reduceMotion) {
      return;
    }
    shakeX.value = withSequence(
      withTiming(-8, { duration: 40 }),
      withTiming(8, { duration: 40 }),
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );
  }, [shakeToken, reduceMotion, shakeX]);

  const boardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View
      style={[styles.board, { width: size, height: size }, boardStyle]}
    >
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        return (
          <View
            key={`slot-${row}-${col}`}
            style={[
              styles.slot,
              {
                height: cellSize,
                left: gap + col * (cellSize + gap),
                top: gap + row * (cellSize + gap),
                width: cellSize,
              },
            ]}
          />
        );
      })}
      {tiles.map((tile) => (
        <AnimatedTile
          key={tile.id}
          cellSize={cellSize}
          gap={gap}
          reduceMotion={reduceMotion}
          tile={tile}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: palette.board,
    borderRadius: 16,
    elevation: 6,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  slot: {
    backgroundColor: palette.cellEmpty,
    borderRadius: 10,
    position: "absolute",
  },
});
