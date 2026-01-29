import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const filteredApprovals = React.useMemo(() => {
    if (filterStatus === "ALL") return approvals;
    return approvals.filter((a) => {
      const status = a.status?.toLowerCase() || "";
      return status === filterStatus.toLowerCase();
    });
  }, [approvals, filterStatus]);

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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadApprovals();
    setRefreshing(false);
  }, [loadApprovals]);

  const loadApprovals = React.useCallback(async () => {
    try {
      // Don't show full page loader if refreshing
      // setIsLoading(true); 
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
      <Text style={styles.emptyText}>
        {filterStatus === "ALL"
          ? "No approvals to review"
          : `No ${filterStatus.toLowerCase()} approvals`}
      </Text>
    </View>
  );

  const FilterTab = ({
    label,
    value,
  }: {
    label: string;
    value: typeof filterStatus;
  }) => (
    <Text
      onPress={() => setFilterStatus(value)}
      style={[
        styles.filterTab,
        filterStatus === value && styles.filterTabActive,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          filterStatus === value && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>
    </Text>
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
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { label: "All", value: "ALL" },
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Rejected", value: "REJECTED" },
          ] as const}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <FilterTab label={item.label} value={item.value} />
          )}
          contentContainerStyle={styles.filterContent}
        />
      </View>

      <FlatList
        data={filteredApprovals}
        renderItem={renderApprovalCard}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#C41230"]} />
        }
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
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    overflow: "hidden", // For borderRadius on Text component
  },
  filterTabActive: {
    backgroundColor: "#C41230",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
