import { StyleSheet, Text, View } from "react-native";
import { palette, tileStyle } from "../game/colors";
import type { Grid } from "../game/state";

interface GameBoardProps {
  grid: Grid;
  size: number;
}

export function GameBoard({ grid, size }: GameBoardProps) {
  const gap = 8;
  const cellSize = (size - gap * 5) / 4;

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const colors = value > 0 ? tileStyle(value) : { bg: palette.cellEmpty, text: palette.textPrimary };
          const fontSize = value >= 1024 ? 22 : value >= 128 ? 26 : 30;

          return (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                {
                  backgroundColor: colors.bg,
                  height: cellSize,
                  left: gap + colIndex * (cellSize + gap),
                  top: gap + rowIndex * (cellSize + gap),
                  width: cellSize,
                },
              ]}
            >
              {value > 0 ? (
                <Text style={[styles.tileText, { color: colors.text, fontSize }]}>
                  {value}
                </Text>
              ) : null}
            </View>
          );
        }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: palette.board,
    borderRadius: 16,
    position: "relative",
  },
  cell: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    position: "absolute",
  },
  tileText: {
    fontWeight: "800",
  },
});
