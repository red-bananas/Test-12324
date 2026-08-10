import { createPageId } from "./pages";
import type { PdfPage } from "./types";

let pickerModule: typeof import("expo-image-picker") | null = null;

function loadPicker() {
  if (!pickerModule) {
    // require keeps Jest happy; module is still loaded once on first Gallery use.
    pickerModule = require("expo-image-picker") as typeof import("expo-image-picker");
  }
  return pickerModule;
}

/** Preload expo-image-picker so the first Gallery tap opens instantly. */
export function warmGalleryPicker(): void {
  loadPicker();
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
  const Picker = loadPicker();
  const result = await Picker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    quality: 1,
    selectionLimit: 500,
  });
  if (result.canceled || !result.assets?.length) return [];
  return result.assets.map((asset) => toPdfPage(asset));
}
