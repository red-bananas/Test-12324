import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
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
import { useFeedback } from "../components/Feedback";
import { PrimaryButton, SecondaryButton } from "../components/ui";
import { formatFileSize, renamePdf, displayExportPath, deleteIfExists, isTemporaryExportPath, savePdfToAppStorage } from "../lib/fs";
import { addRecent, renameRecent } from "../lib/recents";
import { clearSession } from "../lib/session";
import { openFile, saveCopyToFiles, shareFile, showInFilesLocation, isBenignShareError } from "../lib/share";
import { DEMO_SUCCESS, isScreenshotMode } from "../lib/screenshot-demo";

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { showToast, showMessage } = useFeedback();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const params = useLocalSearchParams<{
    name?: string;
    path?: string;
    sizeBytes?: string;
    pageCount?: string;
    saved?: string;
    screenshot?: string;
  }>();
  const screenshotMode = isScreenshotMode(params.screenshot);
  const demo = screenshotMode ? DEMO_SUCCESS : params;

  const [name, setName] = useState(demo.name ?? "document.pdf");
  const [path, setPath] = useState(demo.path ?? "");
  const [saved, setSaved] = useState(demo.saved === "1" || !isTemporaryExportPath(demo.path ?? ""));
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameDraft, setRenameDraft] = useState(name.replace(/\.pdf$/i, ""));
  const [renaming, setRenaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const sizeBytes = Number(demo.sizeBytes ?? 0);
  const pageCount = Number(demo.pageCount ?? 0);

  useEffect(() => {
    if (!renameVisible) {
      setKeyboardOffset(0);
      return;
    }

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOffset(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [renameVisible]);

  const share = async () => {
    try {
      await shareFile(path);
    } catch (error) {
      if (isBenignShareError(error)) return;
      showMessage("Couldn't share PDF", "The file is still saved on this device.");
    }
  };

  const open = async () => {
    try {
      await openFile(path);
    } catch {
      showMessage("Couldn't open PDF", "Install or enable a PDF viewer, then try again.");
    }
  };

  const saveAs = async () => {
    try {
      const copied = await saveCopyToFiles(path, name);
      if (copied) showToast("Copy saved to the folder you selected.", "success");
    } catch {
      showMessage("Couldn't save a copy", "Choose another folder and try again.");
    }
  };

  const saveToApp = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      const previousPath = path;
      const stored = await savePdfToAppStorage(previousPath, name);
      if (previousPath !== stored.filePath) {
        await deleteIfExists(previousPath);
      }
      await addRecent({
        id: stored.fileName,
        name: stored.fileName,
        path: stored.filePath,
        sizeBytes,
        pageCount,
        createdAt: new Date().toISOString(),
      });
      setName(stored.fileName);
      setPath(stored.filePath);
      setSaved(true);
      showToast("PDF saved on this device.", "success");
    } catch {
      showMessage("Couldn't save PDF", "Free up space or try again.");
    } finally {
      setSaving(false);
    }
  };

  const openInFiles = async () => {
    if (!saved) {
      showMessage("Save this PDF first", "Choose Save to keep it in app storage.");
      return;
    }
    try {
      await showInFilesLocation(path);
    } catch {
      showMessage("Couldn't open in Files", "Open Files and browse Android/data for this app.");
    }
  };

  const backToEdit = () => {
    router.replace("/editor");
  };

  const goHome = async () => {
    if (!saved && path) {
      await deleteIfExists(path);
    }
    clearSession();
    router.replace("/");
  };

  const commitRename = async () => {
    if (renaming) return;
    setRenaming(true);
    try {
      const previousPath = path;
      const renamed = await renamePdf(previousPath, renameDraft);
      if (saved) {
        await renameRecent(previousPath, { path: renamed.filePath, name: renamed.fileName });
      }
      setName(renamed.fileName);
      setPath(renamed.filePath);
      setRenameDraft(renamed.fileName.replace(/\.pdf$/i, ""));
      setRenameVisible(false);
      showToast("PDF renamed.", "success");
    } catch (error) {
      showMessage("Couldn't rename PDF", error instanceof Error ? error.message : "Try a different name.");
    } finally {
      setRenaming(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + theme.space.xs, paddingBottom: insets.bottom + theme.space.md }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={backToEdit}
          accessibilityRole="button"
          accessibilityLabel="Back to edit"
          style={({ pressed }) => [styles.editBack, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={21} color={theme.text} />
          <Text style={styles.editBackText}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Start new document"
          style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={18} color={theme.accentText} />
          <Text style={styles.newButtonText}>New</Text>
        </Pressable>
      </View>

      <View style={styles.successMark}>
        <Ionicons name="checkmark" size={37} color={theme.accentBright} />
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>PDF ready</Text>
        <Text style={styles.subtitle}>
          {saved ? "Saved securely on this device" : "Save to keep this PDF on your device"}
        </Text>
      </View>

      <View style={styles.fileSummary}>
        <Pressable
          onPress={() => void open()}
          accessibilityRole="button"
          accessibilityLabel={`Open ${name}`}
          style={({ pressed }) => [styles.fileMain, pressed && styles.pressed]}
        >
          <View style={styles.fileIcon}>
            <Ionicons name="document-text-outline" size={25} color={theme.accentBright} />
          </View>
          <View style={styles.fileMeta}>
            <Text style={styles.name} numberOfLines={2}>
              {name}
              {!saved ? <Text style={styles.notSaved}> (Not saved)</Text> : null}
            </Text>
            <Text style={styles.details}>
              {pageCount} {pageCount === 1 ? "page" : "pages"} · {formatFileSize(sizeBytes)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setRenameVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Rename PDF"
          hitSlop={8}
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.location} numberOfLines={2}>{displayExportPath(path)}</Text>
        <Pressable
          onPress={() => void openInFiles()}
          disabled={!saved}
          accessibilityRole="button"
          accessibilityLabel="Open in Files explorer"
          accessibilityState={{ disabled: !saved }}
          hitSlop={8}
          style={({ pressed }) => [styles.filesLink, (!saved || pressed) && styles.pressed, !saved && styles.filesLinkDisabled]}
        >
          <Text style={[styles.filesLinkText, !saved && styles.filesLinkTextDisabled]}>Files</Text>
          <Ionicons name="chevron-forward" size={16} color={saved ? theme.accentBright : theme.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.actions}>
        {!saved ? (
          <PrimaryButton
            label={saving ? "Saving…" : "Save"}
            onPress={() => void saveToApp()}
            icon={<Ionicons name="download-outline" size={20} color={theme.accentText} />}
          />
        ) : null}
        {saved ? (
          <PrimaryButton
            label="Share"
            onPress={() => void share()}
            icon={<Ionicons name="share-outline" size={20} color={theme.accentText} />}
          />
        ) : (
          <SecondaryButton
            label="Share"
            onPress={() => void share()}
            icon={<Ionicons name="share-outline" size={20} color={theme.text} />}
          />
        )}
        <SecondaryButton
          label="Save as"
          onPress={() => void saveAs()}
          icon={<Ionicons name="save-outline" size={20} color={theme.text} />}
        />
      </View>

      <View style={styles.homeSection}>
        <SecondaryButton
          label="Home"
          onPress={() => void goHome()}
          icon={<Ionicons name="home-outline" size={20} color={theme.text} />}
        />
      </View>

      <View style={styles.noWatermark}>
        <Ionicons name="checkmark-circle-outline" size={16} color={theme.success} />
        <Text style={styles.noWatermarkText}>No watermark added</Text>
      </View>

      <Modal visible={renameVisible} transparent animationType="fade" onRequestClose={() => setRenameVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setRenameVisible(false)} accessibilityLabel="Close rename dialog" />
          <View
            style={[
              styles.renameCard,
              { marginBottom: keyboardOffset > 0 ? Math.max(theme.space.md, keyboardOffset - insets.bottom) : 0 },
            ]}
          >
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
    screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: theme.space.lg, gap: theme.space.sm },
    topBar: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    editBack: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    editBackText: { color: theme.text, fontSize: 14, fontWeight: "700" },
    newButton: {
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: theme.radius.md,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.accent,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    newButtonText: { color: theme.accentText, fontSize: 13, fontWeight: "700" },
    successMark: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accentMuted,
      borderWidth: 2,
      borderColor: theme.accent,
      marginTop: theme.space.sm,
      ...theme.shadow.accent,
    },
    subtitle: { color: theme.textSecondary, fontSize: 13, textAlign: "center" },
    heading: { alignItems: "center", marginBottom: theme.space.sm, gap: 5 },
    title: { ...theme.type.hero, color: theme.text, fontSize: 25, textAlign: "center" },
    fileSummary: {
      minHeight: 84,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.sm,
      padding: theme.space.md,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fileMain: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.space.md,
    },
    fileIcon: {
      width: 50,
      height: 56,
      borderRadius: theme.radius.md,
      backgroundColor: theme.accentMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    fileMeta: { flex: 1, gap: 5 },
    name: { color: theme.text, fontSize: 14, fontWeight: "700", lineHeight: 19 },
    notSaved: { color: theme.warning, fontWeight: "700" },
    details: { color: theme.textTertiary, fontSize: 11 },
    editButton: {
      minWidth: 52,
      minHeight: 44,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      backgroundColor: theme.accentMuted,
    },
    editText: { color: theme.accentBright, fontSize: 13, fontWeight: "700" },
    locationRow: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.space.sm,
      paddingHorizontal: 4,
    },
    location: { flex: 1, color: theme.textSecondary, fontSize: 11, lineHeight: 15 },
    filesLink: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingLeft: theme.space.sm,
    },
    filesLinkText: { color: theme.accentBright, fontSize: 13, fontWeight: "700" },
    filesLinkDisabled: { opacity: 0.45 },
    filesLinkTextDisabled: { color: theme.textTertiary },
    actions: { marginTop: "auto", gap: 9 },
    homeSection: { marginTop: theme.space.lg, gap: 9 },
    noWatermark: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
    noWatermarkText: { color: theme.success, fontSize: 11, fontWeight: "600" },
    modalBackdrop: { flex: 1, justifyContent: "flex-end", padding: theme.space.lg, backgroundColor: "rgba(0,0,0,0.55)" },
    renameCard: { padding: theme.space.lg, borderRadius: theme.radius.xl, backgroundColor: theme.bgElevated, borderWidth: 1, borderColor: theme.border, gap: theme.space.md },
    renameTitle: { ...theme.type.title, color: theme.text },
    renameHelp: { color: theme.textSecondary, fontSize: 12, lineHeight: 18 },
    nameInputRow: { minHeight: 52, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.accentBright, borderRadius: theme.radius.md, backgroundColor: theme.surface, paddingHorizontal: theme.space.md },
    nameInput: { flex: 1, color: theme.text, fontSize: 15, paddingVertical: 12 },
    extension: { color: theme.textTertiary, fontSize: 15 },
    renameActions: { flexDirection: "row", justifyContent: "flex-end", gap: theme.space.sm },
    renameCancel: { minWidth: 76, minHeight: 44, alignItems: "center", justifyContent: "center" },
    renameCancelText: { color: theme.textSecondary, fontSize: 13, fontWeight: "700" },
    renameSave: {
      minWidth: 86,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      backgroundColor: theme.surface,
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    renameSaveText: { color: theme.accentText, fontSize: 13, fontWeight: "700" },
    disabled: { opacity: 0.55 },
    pressed: { opacity: 0.65 },
  });
}
