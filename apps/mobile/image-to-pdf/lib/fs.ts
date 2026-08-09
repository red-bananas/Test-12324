async function loadFS() {
  return import("expo-file-system/legacy");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function getFileSize(uri: string): Promise<number> {
  try {
    const FS = await loadFS();
    const info = await FS.getInfoAsync(toFileUri(uri), { size: true } as never);
    return "size" in info && typeof info.size === "number" ? info.size : 0;
  } catch {
    return 0;
  }
}

export function toFileUri(path: string): string {
  if (path.startsWith("file://") || path.startsWith("content://")) return path;
  return path.startsWith("/") ? `file://${path}` : path;
}

export async function persistPdf(sourcePath: string, destinationUri: string): Promise<string> {
  const FS = await loadFS();
  const sourceUri = toFileUri(sourcePath);
  const targetUri = toFileUri(destinationUri);

  if (sourceUri !== targetUri) {
    await FS.copyAsync({ from: sourceUri, to: targetUri });
  }

  const info = await FS.getInfoAsync(targetUri, { size: true } as never);
  const size = "size" in info && typeof info.size === "number" ? info.size : 0;
  if (!info.exists || size <= 0) {
    throw new Error("The PDF file could not be saved. Please try again.");
  }

  return targetUri;
}

export function normalizePdfName(value: string): string {
  const withoutExtension = value.trim().replace(/\.pdf$/i, "");
  const safeBase = withoutExtension
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .slice(0, 80);
  if (!safeBase) throw new Error("Enter a file name.");
  return `${safeBase}.pdf`;
}

export async function renamePdf(filePath: string, requestedName: string): Promise<{ filePath: string; fileName: string }> {
  const FS = await loadFS();
  const sourceUri = toFileUri(filePath);
  const fileName = normalizePdfName(requestedName);
  const slashIndex = sourceUri.lastIndexOf("/");
  if (slashIndex < 0) throw new Error("This file location cannot be renamed.");
  const nextUri = `${sourceUri.slice(0, slashIndex + 1)}${fileName}`;
  if (nextUri === sourceUri) return { filePath: sourceUri, fileName };

  const existing = await FS.getInfoAsync(nextUri);
  if (existing.exists) throw new Error("A PDF with this name already exists.");
  await FS.moveAsync({ from: sourceUri, to: nextUri });
  return { filePath: nextUri, fileName };
}

export async function getExportDirectory(): Promise<string> {
  const FS = await loadFS();
  const base = FS.documentDirectory ?? FS.cacheDirectory ?? "";
  const dir = `${base}ImageToPDF/`;
  const info = await FS.getInfoAsync(dir);
  if (!info.exists) {
    await FS.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function getTempExportDirectory(): Promise<string> {
  const FS = await loadFS();
  const base = FS.cacheDirectory ?? FS.documentDirectory ?? "";
  const dir = `${base}ImageToPDF/temp/`;
  const info = await FS.getInfoAsync(dir);
  if (!info.exists) {
    await FS.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export function isTemporaryExportPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes("/ImageToPDF/temp/");
}

export async function deleteIfExists(uri: string): Promise<void> {
  try {
    const FS = await loadFS();
    const target = toFileUri(uri);
    const info = await FS.getInfoAsync(target);
    if (info.exists) {
      await FS.deleteAsync(target, { idempotent: true });
    }
  } catch {
    // Best-effort cleanup for cache files.
  }
}

export async function savePdfToAppStorage(
  sourcePath: string,
  fileName?: string,
): Promise<{ filePath: string; fileName: string }> {
  const name = fileName ?? getUniquePdfName();
  const exportDir = await getExportDirectory();
  const filePath = await persistPdf(sourcePath, `${exportDir}${name}`);
  return { filePath, fileName: name };
}

export function getUniquePdfName(): string {
  const now = new Date();
  const part = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    part(now.getMonth() + 1),
    part(now.getDate()),
    "-",
    part(now.getHours()),
    part(now.getMinutes()),
    part(now.getSeconds()),
  ].join("");
  return `PDF-${stamp}.pdf`;
}

export function displayExportPath(filePath: string): string {
  if (isTemporaryExportPath(filePath)) {
    return "Not saved yet";
  }
  const fileName = filePath.split("/").filter(Boolean).at(-1);
  return fileName ? `App storage/ImageToPDF/${fileName}` : "App storage/ImageToPDF";
}

export async function listSavedPdfFiles(): Promise<string[]> {
  const FS = await loadFS();
  const dir = await getExportDirectory();
  const info = await FS.getInfoAsync(dir);
  if (!info.exists) return [];
  const entries = await FS.readDirectoryAsync(dir);
  return entries
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .map((name) => `${dir}${name}`);
}

export async function getSavedPdfsStorageBytes(): Promise<number> {
  const files = await listSavedPdfFiles();
  let total = 0;
  for (const filePath of files) {
    total += await getFileSize(filePath);
  }
  return total;
}

export async function clearSavedPdfs(): Promise<number> {
  const files = await listSavedPdfFiles();
  await Promise.all(files.map((filePath) => deleteIfExists(filePath)));
  return files.length;
}
