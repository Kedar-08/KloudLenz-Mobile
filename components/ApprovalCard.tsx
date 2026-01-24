import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Approval } from "../types/approval";

interface ApprovalCardProps {
  approval: Approval;
  onPress: () => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  approval,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#999";
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.username} numberOfLines={1}>
          {approval.subscriptionNumber || approval.username}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(approval.status) },
          ]}
        >
          <Text style={styles.statusText}>{approval.status}</Text>
        </View>
      </View>



      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Category:</Text>
        <Text style={styles.fieldValue}>
          {approval.category ?? "Service suspension"}
        </Text>
      </View>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Description:</Text>
        <Text style={[styles.fieldValue, styles.description]} numberOfLines={2}>
          {approval.description}
        </Text>
      </View>

      <Text style={styles.timestamp}>
        {new Date(approval.timestamp).toLocaleString()}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f4f6f8",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  username: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    lineHeight: 22,
  },
  userId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginLeft: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
    lineHeight: 20,
  },
  category: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    width: 100,
  },
  fieldValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "left",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginTop: 6,
    lineHeight: 16,
  },
  requestBold: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
});
