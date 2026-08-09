import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import { toFileUri } from "./fs";

const ANDROID_FILES_AUTHORITY = "com.android.externalstorage.documents";
const DIRECTORY_MIME = "vnd.android.document/directory";
const FILE_LOCATION_MIME = "vnd.android.cursor.item/file";
const FLAG_GRANT_READ_URI_PERMISSION = 1;

const FILE_MANAGER_TARGETS: Array<{ packageName: string; className?: string }> = [
  { packageName: "com.google.android.documentsui", className: "com.android.documentsui.files.FilesActivity" },
  { packageName: "com.android.documentsui", className: "com.android.documentsui.files.FilesActivity" },
  { packageName: "com.coloros.filemanager" },
  { packageName: "com.oplus.filemanager" },
  { packageName: "com.oneplus.filemanager" },
  { packageName: "com.sec.android.app.myfiles" },
  { packageName: "com.mi.android.globalFileexplorer" },
];

async function loadSharing() {
  return import("expo-sharing");
}

function getAndroidPackage(): string {
  return Constants.expoConfig?.android?.package ?? "app.autoapp.imagetopdf";
}

function buildDocumentUri(documentId: string): string {
  return `content://${ANDROID_FILES_AUTHORITY}/document/${encodeURIComponent(documentId)}`;
}

function getRelativeAppFilesPath(filePath: string): string | null {
  const normalized = toFileUri(filePath).replace("file://", "");
  const marker = "/files/";
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex < 0) return null;
  return normalized.slice(markerIndex + marker.length) || null;
}

/** Build a Documents UI URI that points at a PDF in app storage (Android Files). */
export function buildAndroidFilesDocumentUri(filePath: string, packageName = getAndroidPackage()): string | null {
  const relativePath = getRelativeAppFilesPath(filePath);
  if (!relativePath) return null;
  return buildDocumentUri(`primary:Android/data/${packageName}/files/${relativePath}`);
}

/** Build a Documents UI URI for the folder that contains the PDF. */
export function buildAndroidFilesFolderUri(filePath: string, packageName = getAndroidPackage()): string | null {
  const relativePath = getRelativeAppFilesPath(filePath);
  if (!relativePath) return null;

  const folderRelative = relativePath.includes("/")
    ? relativePath.slice(0, relativePath.lastIndexOf("/"))
    : "";

  const documentId = folderRelative
    ? `primary:Android/data/${packageName}/files/${folderRelative}`
    : `primary:Android/data/${packageName}/files`;

  return buildDocumentUri(documentId);
}

async function launchFilesIntent(
  data: string,
  type: string,
  target?: { packageName: string; className?: string },
): Promise<void> {
  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
    data,
    type,
    flags: FLAG_GRANT_READ_URI_PERMISSION,
    ...(target ? { packageName: target.packageName, className: target.className } : {}),
  });
}

export async function shareFile(uri: string): Promise<void> {
  const Sharing = await loadSharing();
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error("Sharing is not available on this device.");
  await Sharing.shareAsync(toFileUri(uri), {
    mimeType: "application/pdf",
    dialogTitle: "Share PDF",
    UTI: "com.adobe.pdf",
  });
}

export async function openFile(uri: string): Promise<void> {
  const fileUri = toFileUri(uri);
  if (Platform.OS === "android" && fileUri.startsWith("file://")) {
    const FS = await import("expo-file-system/legacy");
    const contentUri = await FS.getContentUriAsync(fileUri);
    await Linking.openURL(contentUri);
    return;
  }
  await Linking.openURL(fileUri);
}

/** Open the PDF location in the system Files app (Android). */
export async function showInFilesLocation(uri: string): Promise<void> {
  if (Platform.OS !== "android") {
    await openFile(uri);
    return;
  }

  const fileUri = toFileUri(uri);
  const attempts: Array<{ data: string; type: string }> = [];
  const folderUri = buildAndroidFilesFolderUri(fileUri);
  const fileDocumentUri = buildAndroidFilesDocumentUri(fileUri);

  if (folderUri) {
    attempts.push({ data: folderUri, type: DIRECTORY_MIME });
  }
  if (fileDocumentUri) {
    attempts.push({ data: fileDocumentUri, type: FILE_LOCATION_MIME });
  }

  for (const attempt of attempts) {
    for (const target of FILE_MANAGER_TARGETS) {
      try {
        await launchFilesIntent(attempt.data, attempt.type, target);
        return;
      } catch {
        // Try the next file-manager package.
      }
    }
  }

  for (const attempt of attempts) {
    try {
      await launchFilesIntent(attempt.data, attempt.type);
      return;
    } catch {
      // Try the next URI strategy.
    }
  }

  throw new Error("Couldn't open this location in Files.");
}

export async function saveCopyToFiles(uri: string, fileName: string): Promise<string | null> {
  if (Platform.OS !== "android") {
    await shareFile(uri);
    return null;
  }

  const FS = await import("expo-file-system/legacy");
  const permission = await FS.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return null;
  const destination = await FS.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    fileName,
    "application/pdf",
  );
  const contents = await FS.readAsStringAsync(toFileUri(uri), {
    encoding: FS.EncodingType.Base64,
  });
  await FS.writeAsStringAsync(destination, contents, { encoding: FS.EncodingType.Base64 });
  return destination;
}
