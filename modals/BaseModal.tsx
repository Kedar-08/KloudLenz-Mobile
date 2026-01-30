import React from "react";
import { Modal, StyleSheet, View, ViewStyle } from "react-native";

export interface BaseModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  animationType?: "none" | "slide" | "fade";
  containerStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * BaseModal - A reusable base modal component with consistent styling.
 * Use this as the foundation for all modal variants in the app.
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onRequestClose,
  animationType = "fade",
  containerStyle,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, containerStyle]}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
});
