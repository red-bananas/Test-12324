import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

/** Crop a captured photo to the same 4:3 portrait frame shown in the camera preview. */
export async function cropCaptureToPreviewFrame(photo: {
  uri: string;
  width: number;
  height: number;
}): Promise<{ uri: string; width: number; height: number }> {
  const width = photo.width;
  const height = photo.height;
  if (width <= 0 || height <= 0) return photo;

  const targetRatio = 3 / 4;
  const currentRatio = width / height;

  let originX = 0;
  let originY = 0;
  let cropWidth = width;
  let cropHeight = height;

  if (currentRatio > targetRatio) {
    cropWidth = Math.round(height * targetRatio);
    originX = Math.round((width - cropWidth) / 2);
  } else if (currentRatio < targetRatio) {
    cropHeight = Math.round(width / targetRatio);
    originY = Math.round((height - cropHeight) / 2);
  }

  const result = await manipulateAsync(
    photo.uri,
    [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
    { compress: 0.92, format: SaveFormat.JPEG },
  );

  return {
    uri: result.uri,
    width: result.width ?? cropWidth,
    height: result.height ?? cropHeight,
  };
}
