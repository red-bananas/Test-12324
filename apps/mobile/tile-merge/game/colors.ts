export const palette = {
  background: "#1c1b22",
  board: "#2a2833",
  cellEmpty: "#353340",
  textPrimary: "#f5f3ef",
  textMuted: "#a8a3b8",
  accent: "#ff7a59",
  accentSoft: "#ffb4a0",
};

const tileColors: Record<number, { bg: string; text: string }> = {
  2: { bg: "#4a4558", text: "#f5f3ef" },
  4: { bg: "#5c5768", text: "#f5f3ef" },
  8: { bg: "#ff9b7a", text: "#1c1b22" },
  16: { bg: "#ff8660", text: "#1c1b22" },
  32: { bg: "#ff704a", text: "#1c1b22" },
  64: { bg: "#ff5a35", text: "#ffffff" },
  128: { bg: "#ffd166", text: "#1c1b22" },
  256: { bg: "#ffc233", text: "#1c1b22" },
  512: { bg: "#ffad0a", text: "#1c1b22" },
  1024: { bg: "#8ecae6", text: "#1c1b22" },
  2048: { bg: "#219ebc", text: "#ffffff" },
};

export function tileStyle(value: number): { bg: string; text: string } {
  if (tileColors[value]) {
    return tileColors[value];
  }
  return { bg: "#023047", text: "#ffffff" };
}
