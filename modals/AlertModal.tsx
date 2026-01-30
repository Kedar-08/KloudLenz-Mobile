import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BaseModal } from "./BaseModal";

export interface AlertModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmColor?: string;
  cancelColor?: string;
}

/**
 * AlertModal - A configurable alert/confirmation modal with optional buttons.
 * Can be used as a simple alert (single button) or confirmation dialog (two buttons).
 *
 * @example
 * // Simple alert
 * <AlertModal
 *   visible={showAlert}
 *   title="Success"
 *   message="Operation completed successfully!"
 *   onConfirm={() => setShowAlert(false)}
 * />
 *
 * // Confirmation dialog
 * <AlertModal
 *   visible={showConfirm}
 *   title="Confirm Delete"
 *   message="Are you sure you want to delete this item?"
 *   showCancel={true}
 *   confirmLabel="Delete"
 *   confirmColor="#F44336"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
  confirmColor = "#4CAF50",
  cancelColor = "#F44336",
}) => {
  return (
    <BaseModal visible={visible} onRequestClose={onCancel || onConfirm}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.message}>{message}</Text>

      <View style={styles.buttonContainer}>
        {showCancel && onCancel && (
          <Pressable
            style={[styles.button, { borderColor: cancelColor }]}
            onPress={onCancel}
          >
            <Text style={[styles.buttonText, { color: cancelColor }]}>
              {cancelLabel}
            </Text>
          </Pressable>
        )}
        {onConfirm && (
          <Pressable
            style={[
              styles.button,
              { borderColor: confirmColor },
              !showCancel && styles.singleButton,
            ]}
            onPress={onConfirm}
          >
            <Text style={[styles.buttonText, { color: confirmColor }]}>
              {confirmLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  singleButton: {
    flex: 0,
    paddingHorizontal: 40,
    alignSelf: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
