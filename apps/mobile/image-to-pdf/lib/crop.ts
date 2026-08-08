export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };
const MIN_CROP_SIZE = 0.12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function resizeCrop(
  start: CropRect,
  corner: CropCorner,
  deltaX: number,
  deltaY: number,
): CropRect {
  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (corner === "topLeft" || corner === "bottomLeft") {
    left = clamp(left + deltaX, 0, right - MIN_CROP_SIZE);
  } else {
    right = clamp(right + deltaX, left + MIN_CROP_SIZE, 1);
  }

  if (corner === "topLeft" || corner === "topRight") {
    top = clamp(top + deltaY, 0, bottom - MIN_CROP_SIZE);
  } else {
    bottom = clamp(bottom + deltaY, top + MIN_CROP_SIZE, 1);
  }

  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function cropRectToPixels(rect: CropRect, imageWidth: number, imageHeight: number) {
  const originX = Math.round(rect.x * imageWidth);
  const originY = Math.round(rect.y * imageHeight);
  const width = Math.max(1, Math.min(imageWidth - originX, Math.round(rect.width * imageWidth)));
  const height = Math.max(1, Math.min(imageHeight - originY, Math.round(rect.height * imageHeight)));
  return { originX, originY, width, height };
}

export function isFullCrop(rect: CropRect): boolean {
  const epsilon = 0.001;
  return (
    Math.abs(rect.x) < epsilon &&
    Math.abs(rect.y) < epsilon &&
    Math.abs(rect.width - 1) < epsilon &&
    Math.abs(rect.height - 1) < epsilon
  );
}

export function rotateCrop(rect: CropRect, rotation: 0 | 90 | 180 | 270): CropRect {
  if (rotation === 0) return rect;
  const clean = (value: number) => Math.round(value * 1_000_000) / 1_000_000;
  if (rotation === 90) {
    return { x: clean(1 - rect.y - rect.height), y: rect.x, width: rect.height, height: rect.width };
  }
  if (rotation === 180) {
    return { x: clean(1 - rect.x - rect.width), y: clean(1 - rect.y - rect.height), width: rect.width, height: rect.height };
  }
  return { x: rect.y, y: clean(1 - rect.x - rect.width), width: rect.height, height: rect.width };
}
