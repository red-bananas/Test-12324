import type { PaperSize } from "./types";

const MAX_EXPORT_LONG_EDGE = 2048;

const NATIVE_PAPER_SIZE: Record<PaperSize, "A4" | "Letter"> = {
  A4: "A4",
  LETTER: "Letter",
};

export function mapPaperSizeForNative(paperSize: PaperSize): "A4" | "Letter" {
  return NATIVE_PAPER_SIZE[paperSize];
}

/** Downscale very large photos while keeping aspect ratio; native PDF code handles paper fit. */
export function fitImageForExport(
  width: number,
  height: number,
  rotation: 0 | 90 | 180 | 270,
  maxLongEdge = MAX_EXPORT_LONG_EDGE,
): { width: number; height: number } {
  const safeWidth = width > 0 ? width : maxLongEdge;
  const safeHeight = height > 0 ? height : maxLongEdge;
  const sourceWidth = rotation === 90 || rotation === 270 ? safeHeight : safeWidth;
  const sourceHeight = rotation === 90 || rotation === 270 ? safeWidth : safeHeight;
  const longEdge = Math.max(sourceWidth, sourceHeight);
  if (longEdge <= maxLongEdge) {
    return { width: sourceWidth, height: sourceHeight };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

/** Pass file:// URIs to createPdf; the library strips the prefix before decodeFile. */
export function toPdfImageUri(uri: string): string {
  return uri.startsWith("file://") ? uri : `file://${uri.startsWith("/") ? uri : `/${uri}`}`;
}
