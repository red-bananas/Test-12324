import { Platform } from "react-native";
import type { Action } from "expo-image-manipulator";
import { fitImageForExport, mapPaperSizeForNative, toPdfImageUri } from "./exportImage";
import {
  deleteIfExists,
  formatFileSize,
  getFileSize,
  getTempExportDirectory,
  getUniquePdfName,
  persistPdf,
  toFileUri,
} from "./fs";
import type { ExportResult, ExportSettings, PdfPage } from "./types";

type CreatePdfFn = (options: {
  imagePaths: string[];
  name: string;
  paperSize?: string;
}) => Promise<{ filePath: string }> | { filePath: string };

type ManipulateFn = (
  uri: string,
  actions: Action[],
  quality: number,
) => Promise<{ uri: string; width?: number; height?: number }>;

export type PdfExportDeps = {
  createPdf: CreatePdfFn;
  manipulate?: ManipulateFn;
  getTempExportDirectory?: () => Promise<string>;
  getFileSize?: (uri: string) => Promise<number>;
  persistPdf?: (sourcePath: string, destinationUri: string) => Promise<string>;
};

const MIN_IMAGE_BYTES = 512;

async function loadCreatePdf(): Promise<CreatePdfFn> {
  const mod = await import("react-native-pdf-from-image");
  return mod.createPdf as CreatePdfFn;
}

async function loadManipulator(): Promise<ManipulateFn> {
  const mod = await import("expo-image-manipulator");
  return async (uri, actions, quality) => {
    const result = await mod.manipulateAsync(uri, actions, {
      compress: quality,
      format: mod.SaveFormat.JPEG,
    });
    return { uri: result.uri, width: result.width, height: result.height };
  };
}

async function assertReadableImage(uri: string, resolveFileSize: (uri: string) => Promise<number>): Promise<void> {
  const sizeBytes = await resolveFileSize(uri);
  if (sizeBytes < MIN_IMAGE_BYTES) {
    throw new Error("Couldn't prepare one of the page images for export.");
  }
}

export async function preparePageForExport(
  page: PdfPage,
  settings: ExportSettings,
  deps: PdfExportDeps,
): Promise<{ imageUri: string; cacheUri: string }> {
  const manipulate = deps.manipulate ?? (await loadManipulator());
  const resolveFileSize = deps.getFileSize ?? getFileSize;
  const actions: Action[] = [];
  if (page.rotation !== 0) {
    actions.push({ rotate: page.rotation });
  }

  const target = fitImageForExport(page.width, page.height, page.rotation);
  actions.push({ resize: { width: target.width, height: target.height } });

  const result = await manipulate(page.uri, actions, settings.jpegQuality);
  const cacheUri = toFileUri(result.uri);
  await assertReadableImage(cacheUri, resolveFileSize);

  return {
    imageUri: toPdfImageUri(cacheUri),
    cacheUri,
  };
}

export async function exportPdf(
  pages: PdfPage[],
  settings: ExportSettings,
  deps?: Partial<PdfExportDeps>,
): Promise<ExportResult> {
  if (pages.length === 0) {
    throw new Error("Add at least one page before exporting.");
  }

  const createPdf = deps?.createPdf ?? (await loadCreatePdf());
  const resolveTempDir = deps?.getTempExportDirectory ?? getTempExportDirectory;
  const resolveFileSize = deps?.getFileSize ?? getFileSize;
  const persistOutput = deps?.persistPdf ?? persistPdf;
  const exportDir = await resolveTempDir();
  const fileName = getUniquePdfName();
  const baseName = fileName.replace(/\.pdf$/i, "");
  const sharedDeps: PdfExportDeps = { createPdf, ...deps };

  const imagePaths: string[] = [];
  const tempImageUris: string[] = [];

  try {
    for (const page of pages) {
      const prepared = await preparePageForExport(page, settings, sharedDeps);
      imagePaths.push(prepared.imageUri);
      tempImageUris.push(prepared.cacheUri);
    }

    if (Platform.OS === "web") {
      const filePath = `${exportDir}${fileName}`;
      return {
        filePath,
        fileName,
        sizeBytes: 0,
        pageCount: pages.length,
        saved: false,
      };
    }

    const result = await createPdf({
      imagePaths,
      name: baseName,
      paperSize: mapPaperSizeForNative(settings.paperSize),
    });

    if (!result.filePath) {
      throw new Error("The PDF generator did not create a file. Please try again.");
    }

    const filePath = await persistOutput(result.filePath, `${exportDir}${fileName}`);
    const sizeBytes = await resolveFileSize(filePath);
    if (sizeBytes <= 0) {
      throw new Error("The PDF file is empty. Please try again.");
    }

    for (const uri of tempImageUris) {
      await deleteIfExists(uri);
    }

    return {
      filePath,
      fileName,
      sizeBytes,
      pageCount: pages.length,
      saved: false,
    };
  } catch (error) {
    await Promise.all(tempImageUris.map((uri) => deleteIfExists(uri)));
    throw error;
  }
}

const PDF_BASE_OVERHEAD_BYTES = 4096;
const PDF_PAGE_OVERHEAD_BYTES = 1536;

/** Rough JPEG+PDF size before export — good enough for editor hint copy. */
export function estimatePdfSizeBytes(pages: PdfPage[], settings: ExportSettings): number {
  if (pages.length === 0) return 0;

  let imageBytes = 0;
  const bytesPerPixel = 0.06 + settings.jpegQuality * 0.14;
  for (const page of pages) {
    const target = fitImageForExport(page.width, page.height, page.rotation);
    imageBytes += target.width * target.height * bytesPerPixel;
  }

  return Math.max(
    1024,
    Math.round(PDF_BASE_OVERHEAD_BYTES + imageBytes + pages.length * PDF_PAGE_OVERHEAD_BYTES),
  );
}

export function formatPdfSizeEstimate(pages: PdfPage[], settings: ExportSettings): string {
  const bytes = estimatePdfSizeBytes(pages, settings);
  if (bytes <= 0) return "";
  return `~${formatFileSize(bytes)}`;
}
