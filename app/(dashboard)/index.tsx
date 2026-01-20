import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ApprovalCard } from "../../components/ApprovalCard";
import { eventBus } from "../../services/eventBus";
import { mockApi } from "../../services/mockApi";
import { Approval } from "../../types/approval";

export default function DashboardScreen() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reload approvals whenever this screen gains focus (so list reflects approve/reject actions)
  useFocusEffect(
    React.useCallback(() => {
      loadApprovals();
    }, []),
  );

  // Listen for optimistic updates from detail screen
  useEffect(() => {
    const handler = (payload: {
      id: string;
      status?: string;
      rejectionReason?: string;
    }) => {
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === payload.id ? { ...a, ...(payload as Partial<Approval>) } : a,
        ),
      );
    };
    eventBus.on("approvalUpdated", handler);
    return () => {
      eventBus.off("approvalUpdated", handler);
    };
  }, []);

  const loadApprovals = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await mockApi.getApprovals();
      setApprovals(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load approvals";
      setError(message);
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApprovalPress = (approval: Approval) => {
    router.push({
      pathname: "/(dashboard)/[id]",
      params: { id: approval.id },
    });
  };

  const renderApprovalCard = ({ item }: { item: Approval }) => (
    <ApprovalCard approval={item} onPress={() => handleApprovalPress(item)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No approvals to review</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading approvals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={approvals}
        renderItem={renderApprovalCard}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
