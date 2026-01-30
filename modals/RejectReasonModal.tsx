import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BaseModal } from "./BaseModal";

export interface RejectReasonModalProps {
  visible: boolean;
  title?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
  isLoading?: boolean;
}

/**
 * RejectReasonModal - A modal for capturing rejection reasons with text input.
 * Configurable title, placeholder, and button labels for reuse in different contexts.
 *
 * @example
 * <RejectReasonModal
 *   visible={showRejectModal}
 *   title="Rejection Reason"
 *   placeholder="Please provide a reason for rejection..."
 *   onCancel={() => setShowRejectModal(false)}
 *   onSubmit={(reason) => handleReject(reason)}
 *   isLoading={isProcessing}
 * />
 */
export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  visible,
  title = "Rejection Reason",
  placeholder = "Please provide a reason for rejection...",
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  onSubmit,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      setReason("");
    }
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  return (
    <BaseModal visible={visible} onRequestClose={handleCancel}>
      <Text style={styles.title}>{title}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        multiline={true}
        numberOfLines={4}
        value={reason}
        onChangeText={setReason}
        editable={!isLoading}
      />

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.submitButton,
            (!reason.trim() || isLoading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!reason.trim() || isLoading}
        >
          <Text
            style={[
              styles.submitButtonText,
              (!reason.trim() || isLoading) && styles.submitButtonTextDisabled,
            ]}
          >
            {isLoading ? "Submitting..." : submitLabel}
          </Text>
        </Pressable>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
    textAlignVertical: "top",
    minHeight: 100,
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
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F44336",
  },
  submitButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  submitButtonDisabled: {
    borderColor: "#ccc",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  submitButtonTextDisabled: {
    color: "#ccc",
  },
});
