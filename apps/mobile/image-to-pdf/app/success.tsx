import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, SecondaryButton } from "../components/ui";
import { displayExportPath, formatFileSize, renamePdf } from "../lib/fs";
import { renameRecent } from "../lib/recents";
import { clearSession } from "../lib/session";
import { openFile, saveCopyToFiles, shareFile } from "../lib/share";
import { AppTheme, useAppTheme } from "../lib/theme";

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams<{
    name?: string;
    path?: string;
    sizeBytes?: string;
    pageCount?: string;
    displayPath?: string;
  }>();

  const [name, setName] = useState(params.name ?? "document.pdf");
  const [path, setPath] = useState(params.path ?? "");
  const [displayPath, setDisplayPath] = useState(params.displayPath ?? params.path ?? "");
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameDraft, setRenameDraft] = useState(name.replace(/\.pdf$/i, ""));
  const [renaming, setRenaming] = useState(false);
  const sizeBytes = Number(params.sizeBytes ?? 0);
  const pageCount = Number(params.pageCount ?? 0);

  const share = async () => {
    try {
      await shareFile(path);
    } catch {
      Alert.alert("Couldn't share PDF", "The file is still saved on this device.");
    }
  };

  const open = async () => {
    try {
      await openFile(path);
    } catch {
      Alert.alert("Couldn't open PDF", "Install or enable a PDF viewer, then try again.");
    }
  };

  const saveToFiles = async () => {
    try {
      const copied = await saveCopyToFiles(path, name);
      if (copied) Alert.alert("Copy saved", "The PDF is now available in the folder you selected.");
    } catch {
      Alert.alert("Couldn't save a copy", "Choose another folder and try again.");
    }
  };

  const commitRename = async () => {
    if (renaming) return;
    setRenaming(true);
    try {
      const previousPath = path;
      const renamed = await renamePdf(previousPath, renameDraft);
      await renameRecent(previousPath, { path: renamed.filePath, name: renamed.fileName });
      setName(renamed.fileName);
      setPath(renamed.filePath);
      setDisplayPath(displayExportPath(renamed.filePath));
      setRenameDraft(renamed.fileName.replace(/\.pdf$/i, ""));
      setRenameVisible(false);
    } catch (error) {
      Alert.alert("Couldn't rename PDF", error instanceof Error ? error.message : "Try a different name.");
    } finally {
      setRenaming(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + theme.space.xxl, paddingBottom: insets.bottom + theme.space.md }]}>
      <View style={styles.successMark}>
        <Ionicons name="checkmark" size={37} color={theme.isDark ? "#07150E" : "#FFFFFF"} />
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>Your PDF is ready</Text>
        <Text style={styles.subtitle}>Saved securely on this device</Text>
      </View>

      <View style={styles.fileSummary}>
        <Pressable
          onPress={() => void saveToFiles()}
          accessibilityRole="button"
          accessibilityLabel="Save a copy in Files"
          style={({ pressed }) => [styles.fileIcon, pressed && styles.pressed]}
        >
          <Ionicons name="document-text-outline" size={25} color={theme.accentBright} />
          <View style={styles.filesBadge}><Ionicons name="folder-outline" size={10} color="#FFFFFF" /></View>
        </Pressable>
        <View style={styles.fileMeta}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.details}>{pageCount} {pageCount === 1 ? "page" : "pages"} · {formatFileSize(sizeBytes)}</Text>
        </View>
        <Pressable
          onPress={() => setRenameVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Rename PDF"
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        >
          <Ionicons name="pencil-outline" size={18} color={theme.accentBright} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => void saveToFiles()}
        accessibilityRole="button"
        accessibilityLabel="Choose a visible folder in Files"
        style={({ pressed }) => [styles.locationRow, pressed && styles.pressed]}
      >
        <Ionicons name="folder-open-outline" size={20} color={theme.textTertiary} />
        <View style={styles.locationCopy}>
          <Text style={styles.locationLabel}>App storage</Text>
          <Text style={styles.path} selectable numberOfLines={2}>{displayPath}</Text>
        </View>
        <View style={styles.filesAction}>
          <Text style={styles.filesActionText}>Files</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.accentBright} />
        </View>
      </Pressable>

      <View style={styles.actions}>
        <PrimaryButton
          label="Share PDF"
          onPress={() => void share()}
          icon={<Ionicons name="share-outline" size={20} color={theme.accentText} />}
        />
        <SecondaryButton
          label="Open PDF"
          onPress={() => void open()}
          icon={<Ionicons name="open-outline" size={20} color={theme.text} />}
        />
        <Pressable
          onPress={() => {
            clearSession();
            router.replace("/");
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.createAnother, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={18} color={theme.textSecondary} />
          <Text style={styles.createAnotherText}>Create another</Text>
        </Pressable>
      </View>

      <View style={styles.noWatermark}>
        <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
        <Text style={styles.noWatermarkText}>No watermark added</Text>
      </View>

      <Modal visible={renameVisible} transparent animationType="fade" onRequestClose={() => setRenameVisible(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setRenameVisible(false)} accessibilityLabel="Close rename dialog" />
          <View style={styles.renameCard}>
            <Text style={styles.renameTitle}>Rename PDF</Text>
            <Text style={styles.renameHelp}>Use a clear name so it is easy to find later.</Text>
            <View style={styles.nameInputRow}>
              <TextInput
                value={renameDraft}
                onChangeText={setRenameDraft}
                placeholder="Document name"
                placeholderTextColor={theme.textTertiary}
                autoFocus
                selectTextOnFocus
                maxLength={80}
                returnKeyType="done"
                onSubmitEditing={() => void commitRename()}
                style={styles.nameInput}
              />
              <Text style={styles.extension}>.pdf</Text>
            </View>
            <View style={styles.renameActions}>
              <Pressable onPress={() => setRenameVisible(false)} style={styles.renameCancel} accessibilityRole="button">
                <Text style={styles.renameCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => void commitRename()} disabled={renaming} style={[styles.renameSave, renaming && styles.disabled]} accessibilityRole="button">
                <Text style={styles.renameSaveText}>{renaming ? "Saving…" : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: theme.space.lg },
    successMark: { width: 70, height: 70, borderRadius: 35, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: theme.success, shadowColor: theme.success, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 5 },
    heading: { alignItems: "center", marginTop: theme.space.md, marginBottom: theme.space.lg, gap: 5 },
    title: { ...theme.type.hero, color: theme.text, fontSize: 25, textAlign: "center" },
    subtitle: { color: theme.textSecondary, fontSize: 13 },
    fileSummary: { minHeight: 84, flexDirection: "row", alignItems: "center", gap: theme.space.md, padding: theme.space.md, borderRadius: theme.radius.lg, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    fileIcon: { width: 50, height: 56, borderRadius: theme.radius.md, backgroundColor: theme.accentMuted, alignItems: "center", justifyContent: "center" },
    filesBadge: { position: "absolute", right: -3, bottom: -3, width: 20, height: 20, borderRadius: 7, backgroundColor: theme.accent, borderWidth: 2, borderColor: theme.surface, alignItems: "center", justifyContent: "center" },
    fileMeta: { flex: 1, gap: 5 },
    name: { color: theme.text, fontSize: 14, fontWeight: "700", lineHeight: 19 },
    details: { color: theme.textTertiary, fontSize: 11 },
    editButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.accentMuted },
    locationRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
    locationCopy: { flex: 1, gap: 3 },
    locationLabel: { color: theme.textTertiary, fontSize: 10 },
    path: { color: theme.textSecondary, fontSize: 11, lineHeight: 16 },
    filesAction: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 2, paddingLeft: theme.space.sm },
    filesActionText: { color: theme.accentBright, fontSize: 12, fontWeight: "700" },
    actions: { marginTop: "auto", gap: 9 },
    createAnother: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
    createAnotherText: { color: theme.textSecondary, fontSize: 13, fontWeight: "600" },
    noWatermark: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
    noWatermarkText: { color: theme.success, fontSize: 11, fontWeight: "600" },
    modalBackdrop: { flex: 1, justifyContent: "center", padding: theme.space.lg, backgroundColor: "rgba(0,0,0,0.55)" },
    renameCard: { padding: theme.space.lg, borderRadius: theme.radius.xl, backgroundColor: theme.bgElevated, borderWidth: 1, borderColor: theme.border, gap: theme.space.md },
    renameTitle: { ...theme.type.title, color: theme.text },
    renameHelp: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
    nameInputRow: { minHeight: 52, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.accentBright, borderRadius: theme.radius.md, backgroundColor: theme.surface, paddingHorizontal: theme.space.md },
    nameInput: { flex: 1, color: theme.text, fontSize: 15, paddingVertical: 12 },
    extension: { color: theme.textTertiary, fontSize: 15 },
    renameActions: { flexDirection: "row", justifyContent: "flex-end", gap: theme.space.sm },
    renameCancel: { minWidth: 76, minHeight: 44, alignItems: "center", justifyContent: "center" },
    renameCancelText: { color: theme.textSecondary, fontSize: 13, fontWeight: "700" },
    renameSave: { minWidth: 86, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: theme.radius.md, backgroundColor: theme.accent },
    renameSaveText: { color: theme.accentText, fontSize: 13, fontWeight: "700" },
    disabled: { opacity: 0.55 },
    pressed: { opacity: 0.65 },
  });
}
