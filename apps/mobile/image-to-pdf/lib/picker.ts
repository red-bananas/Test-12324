import { createPageId } from "./pages";
import type { PdfPage } from "./types";

async function loadPicker() {
  return import("expo-image-picker");
}

function toPdfPage(asset: {
  uri: string;
  width: number;
  height: number;
}): PdfPage {
  return {
    id: createPageId(),
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    rotation: 0,
  };
}

export async function pickImagesFromGallery(): Promise<PdfPage[]> {
  const Picker = await loadPicker();
  const result = await Picker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    quality: 1,
    selectionLimit: 500,
  });
  if (result.canceled || !result.assets?.length) return [];
  return result.assets.map((asset) => toPdfPage(asset));
}
