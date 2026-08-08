import { Linking, Platform } from "react-native";
import { toFileUri } from "./fs";

async function loadSharing() {
  return import("expo-sharing");
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
