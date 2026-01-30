import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { BaseModal } from "./BaseModal";

export interface ConfirmationModalProps {
  visible: boolean;
  message: string;
  duration?: number; // Auto-dismiss duration in milliseconds (default: 2000)
  onDismiss: () => void;
}

/**
 * ConfirmationModal - Displays a brief confirmation message that auto-dismisses.
 * Used for success/info messages that don't require user interaction.
 *
 * @example
 * <ConfirmationModal
 *   visible={showConfirmation}
 *   message="The request was rejected."
 *   duration={2000}
 *   onDismiss={() => setShowConfirmation(false)}
 * />
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  message,
  duration = 2000,
  onDismiss,
}) => {
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(handleDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, handleDismiss]);

  return (
    <BaseModal
      visible={visible}
      onRequestClose={handleDismiss}
      containerStyle={styles.container}
    >
      <Text style={styles.message}>{message}</Text>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
  },
  message: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
