import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTheme, useAppTheme } from "../lib/theme";
import { PrimaryButton, SecondaryButton } from "./ui";

type ToastTone = "info" | "success" | "error";

type DialogState = {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type FeedbackContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
  showMessage: (title: string, message?: string) => void;
  confirm: (options: {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback must be used within FeedbackProvider");
  return context;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setToast(null);
    });
  }, [opacity]);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, tone });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => hideToast(), 3200);
    },
    [hideToast, opacity],
  );

  const showMessage = useCallback((title: string, message?: string) => {
    setDialog({
      title,
      message,
      confirmLabel: "OK",
      onConfirm: () => setDialog(null),
    });
  }, []);

  const confirm = useCallback(
    (options: {
      title: string;
      message?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      destructive?: boolean;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setDialog({
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        destructive: options.destructive,
        onConfirm: () => {
          setDialog(null);
          options.onConfirm();
        },
        onCancel: () => {
          setDialog(null);
          options.onCancel?.();
        },
      });
    },
    [],
  );

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast, showMessage, confirm }), [confirm, showMessage, showToast]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastWrap,
            { top: insets.top + 12, opacity },
            toast.tone === "success" && styles.toastSuccess,
            toast.tone === "error" && styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      ) : null}

      <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => dialog?.onCancel?.()}>
        <View style={styles.dialogBackdrop}>
          <Pressable
            style={styles.dialogDismiss}
            onPress={() => dialog?.onCancel?.()}
            accessibilityLabel="Close dialog"
          />
          {dialog ? (
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>{dialog.title}</Text>
              {dialog.message ? <Text style={styles.dialogMessage}>{dialog.message}</Text> : null}
              <View style={styles.dialogActions}>
                {dialog.cancelLabel ? (
                  <View style={styles.dialogAction}>
                    <SecondaryButton label={dialog.cancelLabel} onPress={() => dialog.onCancel?.()} />
                  </View>
                ) : null}
                <View style={styles.dialogAction}>
                  {dialog.destructive ? (
                    <Pressable
                      onPress={dialog.onConfirm}
                      accessibilityRole="button"
                      style={({ pressed }) => [styles.destructiveButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.destructiveText}>{dialog.confirmLabel}</Text>
                    </Pressable>
                  ) : (
                    <PrimaryButton label={dialog.confirmLabel} onPress={dialog.onConfirm} />
                  )}
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </FeedbackContext.Provider>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    toastWrap: {
      position: "absolute",
      left: theme.space.md,
      right: theme.space.md,
      paddingHorizontal: theme.space.md,
      paddingVertical: 12,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...theme.shadow.card,
    },
    toastSuccess: { borderColor: theme.success },
    toastError: { borderColor: theme.danger },
    toastText: { color: theme.text, fontSize: 13, fontWeight: "600", textAlign: "center" },
    dialogBackdrop: {
      flex: 1,
      justifyContent: "center",
      padding: theme.space.lg,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    dialogDismiss: { ...StyleSheet.absoluteFillObject },
    dialogCard: {
      padding: theme.space.lg,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.bgElevated,
      borderWidth: 1,
      borderColor: theme.border,
      gap: theme.space.md,
    },
    dialogTitle: { ...theme.type.title, color: theme.text },
    dialogMessage: { color: theme.textSecondary, fontSize: 13, lineHeight: 19 },
    dialogActions: { flexDirection: "row", gap: theme.space.sm },
    dialogAction: { flex: 1 },
    destructiveButton: {
      minHeight: 56,
      borderRadius: theme.radius.lg,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(239,68,68,0.16)",
      borderWidth: 1,
      borderColor: theme.danger,
    },
    destructiveText: { color: theme.danger, fontSize: 15, fontWeight: "700" },
    pressed: { opacity: 0.72 },
  });
}
