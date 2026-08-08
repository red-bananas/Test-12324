import { Platform } from "react-native";
import { getExportDirectory, getFileSize, getUniquePdfName, persistPdf } from "./fs";
import type { ExportResult, ExportSettings, PdfPage } from "./types";

import type { Action } from "expo-image-manipulator";

type CreatePdfFn = (options: {
  imagePaths: string[];
  name: string;
  paperSize?: string;
}) => Promise<{ filePath: string }> | { filePath: string };

type ManipulateFn = (uri: string, actions: Action[]) => Promise<{ uri: string }>;

export type PdfExportDeps = {
  createPdf: CreatePdfFn;
  manipulate?: ManipulateFn;
  getExportDirectory?: () => Promise<string>;
  getFileSize?: (uri: string) => Promise<number>;
  persistPdf?: (sourcePath: string, destinationUri: string) => Promise<string>;
};

async function loadCreatePdf(): Promise<CreatePdfFn> {
  const mod = await import("react-native-pdf-from-image");
  return mod.createPdf as CreatePdfFn;
}

async function loadManipulator(): Promise<ManipulateFn> {
  const mod = await import("expo-image-manipulator");
  return async (uri, actions) => {
    const result = await mod.manipulateAsync(uri, actions, {
      compress: 0.9,
      format: mod.SaveFormat.JPEG,
    });
    return { uri: result.uri };
  };
}

async function prepareImageUri(page: PdfPage, deps: PdfExportDeps): Promise<string> {
  if (page.rotation === 0) return page.uri;
  const manipulate = deps.manipulate ?? (await loadManipulator());
  const result = await manipulate(page.uri, [{ rotate: page.rotation }]);
  return result.uri;
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
  const resolveExportDir = deps?.getExportDirectory ?? getExportDirectory;
  const resolveFileSize = deps?.getFileSize ?? getFileSize;
  const persistOutput = deps?.persistPdf ?? persistPdf;
  const exportDir = await resolveExportDir();
  const fileName = getUniquePdfName();
  const baseName = fileName.replace(/\.pdf$/i, "");

  const imagePaths: string[] = [];
  for (const page of pages) {
    imagePaths.push(await prepareImageUri(page, { createPdf, ...deps }));
  }

  if (Platform.OS === "web") {
    const filePath = `${exportDir}${fileName}`;
    return {
      filePath,
      fileName,
      sizeBytes: 0,
      pageCount: pages.length,
    };
  }

  const result = await createPdf({
    imagePaths,
    name: baseName,
    paperSize: settings.paperSize,
  });

  if (!result.filePath) {
    throw new Error("The PDF generator did not create a file. Please try again.");
  }

  const filePath = await persistOutput(result.filePath, `${exportDir}${fileName}`);
  const sizeBytes = await resolveFileSize(filePath);
  if (sizeBytes <= 0) {
    throw new Error("The PDF file is empty. Please try again.");
  }

  return {
    filePath,
    fileName,
    sizeBytes,
    pageCount: pages.length,
  };
}
