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
import { RejectModal } from "../../components/RejectModal";
import { eventBus } from "../../services/eventBus";
import { mockApi } from "../../services/mockApi";
import { Approval } from "../../types/approval";

export default function ApprovalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

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
      Alert.alert("Success", "Approval has been approved", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
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
      Alert.alert("Success", "Approval has been rejected", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
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
            {approval.category ?? "Service suspension"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username:</Text>
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
                {approval.category ?? "Service suspension"}
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Suspension policy:</Text>
              <Text style={styles.infoValue}>{approval.suspensionPolicy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Execution date:</Text>
              <Text style={styles.infoValue}>
                {new Date(approval.executionDate).toLocaleDateString()}
              </Text>
            </View>
            {approval.extraFields &&
              (() => {
                const skipKeys = new Set([
                  "suspension policy",
                  "execution date",
                  "executiondate",
                  "suspensionpolicy",
                ]);
                return Object.entries(approval.extraFields)
                  .filter(([key, value]) => {
                    const k = key.trim().toLowerCase();
                    if (skipKeys.has(k)) return false;
                    // also avoid duplicates if value matches known fields
                    if (value === approval.suspensionPolicy) return false;
                    if (value === approval.executionDate) return false;
                    return true;
                  })
                  .map(([key, value]) => (
                    <View key={key} style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{key}:</Text>
                      <Text style={styles.infoValue}>{value}</Text>
                    </View>
                  ));
              })()}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => setRejectModalVisible(true)}
          disabled={isProcessing}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.approveButton,
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={handleApprove}
          disabled={isProcessing}
        >
          <Text style={styles.approveButtonText}>
            {isProcessing ? "Processing..." : "Approve"}
          </Text>
        </TouchableOpacity>
      </View>

      <RejectModal
        visible={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onSubmit={handleRejectSubmit}
        isLoading={isProcessing}
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
  rejectButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
});
