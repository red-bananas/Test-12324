import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { PdfPage } from "./types";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
export type CropEdge = "top" | "right" | "bottom" | "left";
export type CropHandle = CropCorner | CropEdge | "move";

export const FULL_CROP: CropRect = { x: 0, y: 0, width: 1, height: 1 };
const MIN_CROP_SIZE = 0.12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function moveCrop(start: CropRect, deltaX: number, deltaY: number): CropRect {
  return {
    ...start,
    x: clamp(start.x + deltaX, 0, 1 - start.width),
    y: clamp(start.y + deltaY, 0, 1 - start.height),
  };
}

export function resizeCrop(
  start: CropRect,
  handle: CropHandle,
  deltaX: number,
  deltaY: number,
): CropRect {
  if (handle === "move") {
    return moveCrop(start, deltaX, deltaY);
  }

  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (handle === "topLeft" || handle === "bottomLeft" || handle === "left") {
    left = clamp(left + deltaX, 0, right - MIN_CROP_SIZE);
  }
  if (handle === "topRight" || handle === "bottomRight" || handle === "right") {
    right = clamp(right + deltaX, left + MIN_CROP_SIZE, 1);
  }
  if (handle === "topLeft" || handle === "topRight" || handle === "top") {
    top = clamp(top + deltaY, 0, bottom - MIN_CROP_SIZE);
  }
  if (handle === "bottomLeft" || handle === "bottomRight" || handle === "bottom") {
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

export function cropRectFromPage(page: PdfPage): CropRect {
  if (!page.crop) return FULL_CROP;
  return rotateCrop(page.crop, page.rotation);
}

export async function applyRectCrop(
  sourceUri: string,
  imageWidth: number,
  imageHeight: number,
  rect: CropRect,
): Promise<{ uri: string; width: number; height: number }> {
  if (isFullCrop(rect)) {
    return { uri: sourceUri, width: imageWidth, height: imageHeight };
  }

  const { originX, originY, width, height } = cropRectToPixels(rect, imageWidth, imageHeight);
  const result = await manipulateAsync(
    sourceUri,
    [{ crop: { originX, originY, width, height } }],
    { compress: 0.92, format: SaveFormat.JPEG },
  );

  return {
    uri: result.uri,
    width: result.width ?? width,
    height: result.height ?? height,
  };
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
