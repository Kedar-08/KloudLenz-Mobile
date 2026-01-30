import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { JsonDisplay } from "../../components/JsonDisplay";
import { ConfirmationModal, RejectReasonModal } from "../../modals";
import { eventBus } from "../../services/eventBus";
import { mockApi } from "../../services/mockApi";
import { Approval } from "../../types/approval";
import { formatCamelCase } from "../../utils/formatText";

export default function ApprovalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  useEffect(() => {
    loadApprovalDetails();
  }, [id]);

  const loadApprovalDetails = async () => {
    try {
      setIsLoading(true);
      if (!id) throw new Error("No approval ID provided");
      const data = await mockApi.getApprovalById(id);
      setApproval(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load approval";
      Alert.alert("Error", message);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approval) return;
    const prevStatus = approval.status;
    try {
      // optimistic update: notify list immediately
      setApproval((p) => (p ? { ...p, status: "approved" } : p));
      eventBus.emit("approvalUpdated", { id: approval.id, status: "approved" });

      setIsProcessing(true);
      await mockApi.approveRequest(approval.id);

      // Wait a bit for backend to process
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show confirmation modal (auto-dismisses after timer)
      setConfirmationMessage("This request has been approved.");
      setConfirmationModalVisible(true);
    } catch (err) {
      // rollback optimistic update
      setApproval((p) => (p ? { ...p, status: prevStatus } : p));
      eventBus.emit("approvalUpdated", { id: approval.id, status: prevStatus });
      const message = err instanceof Error ? err.message : "Failed to approve";
      Alert.alert("Error", message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!approval) return;
    const prevStatus = approval.status;
    const prevReason = approval.rejectionReason;
    try {
      // optimistic update
      setApproval((p) =>
        p ? { ...p, status: "rejected", rejectionReason: reason } : p,
      );
      eventBus.emit("approvalUpdated", {
        id: approval.id,
        status: "rejected",
        rejectionReason: reason,
      });

      setIsProcessing(true);
      await mockApi.rejectRequest(approval.id, reason);
      setRejectModalVisible(false);

      // Wait a bit for backend to process
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show confirmation modal (auto-dismisses after timer)
      setConfirmationMessage("This request has been rejected.");
      setConfirmationModalVisible(true);
    } catch (err) {
      // rollback optimistic update
      setApproval((p) =>
        p ? { ...p, status: prevStatus, rejectionReason: prevReason } : p,
      );
      eventBus.emit("approvalUpdated", {
        id: approval.id,
        status: prevStatus,
        rejectionReason: prevReason,
      });
      const message = err instanceof Error ? err.message : "Failed to reject";
      Alert.alert("Error", message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmationDismiss = () => {
    setConfirmationModalVisible(false);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!approval) {
    return (
      <View style={styles.centerContainer}>
        <Text>Approval not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.mainTitle}>
            The user wants to make changes in{" "}
            {formatCamelCase(approval.category) || "Service suspension"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account No.:</Text>
              <Text style={styles.infoValue}>{approval.username}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{approval.userId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>
                {formatCamelCase(approval.category) || "Service suspension"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{approval.description}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Requested on:</Text>
              <Text style={styles.infoValue}>
                {new Date(approval.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fields</Text>
          <View style={styles.infoContainer}>
            {approval.extraFields && (
              <JsonDisplay data={approval.extraFields} />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.rejectButton,
            (isProcessing || approval.status === "rejected") &&
              styles.rejectButtonDisabled,
          ]}
          onPress={() => setRejectModalVisible(true)}
          disabled={isProcessing || approval.status === "rejected"}
        >
          <Text
            style={[
              styles.rejectButtonText,
              (isProcessing || approval.status === "rejected") &&
                styles.buttonTextDisabled,
            ]}
          >
            {approval.status === "rejected" ? "Rejected" : "Reject"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.approveButton,
            (isProcessing || approval.status === "approved") &&
              styles.approveButtonDisabled,
          ]}
          onPress={handleApprove}
          disabled={isProcessing || approval.status === "approved"}
        >
          <Text
            style={[
              styles.approveButtonText,
              (isProcessing || approval.status === "approved") &&
                styles.buttonTextDisabled,
            ]}
          >
            {isProcessing
              ? "Processing..."
              : approval.status === "approved"
                ? "Approved"
                : "Approve"}
          </Text>
        </TouchableOpacity>
      </View>

      <RejectReasonModal
        visible={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onSubmit={handleRejectSubmit}
        isLoading={isProcessing}
      />

      <ConfirmationModal
        visible={confirmationModalVisible}
        message={confirmationMessage}
        duration={2000}
        onDismiss={handleConfirmationDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: "#333",
    flex: 1.5,
    textAlign: "right",
  },
  amountValue: {
    fontWeight: "700",
    color: "#1976d2",
  },
  attachmentList: {
    gap: 8,
  },
  attachmentItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  attachmentText: {
    fontSize: 13,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  approveButtonDisabled: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
  },
  approveButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#F44336",
  },
  rejectButtonDisabled: {
    backgroundColor: "#FFEBEE",
    borderColor: "#EF9A9A",
  },
  rejectButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDisabled: {
    color: "#999",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
});
