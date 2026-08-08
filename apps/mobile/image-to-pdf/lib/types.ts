export const MAX_PAGES = 500;
export const WARN_PAGES = 50;

export type PaperSize = "A4" | "LETTER";
export type AppearancePreference = "system" | "light" | "dark";

export type PdfPage = {
  id: string;
  uri: string;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  /** Original image retained so crop edits can always be changed or reset. */
  originalUri?: string;
  originalWidth?: number;
  originalHeight?: number;
  crop?: { x: number; y: number; width: number; height: number };
  cropRotation?: 0 | 90 | 180 | 270;
};

export type RecentPdf = {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  pageCount: number;
  createdAt: string;
};

export type ExportSettings = {
  paperSize: PaperSize;
  jpegQuality: number;
  appearance?: AppearancePreference;
};

export type ExportResult = {
  filePath: string;
  fileName: string;
  sizeBytes: number;
  pageCount: number;
};
