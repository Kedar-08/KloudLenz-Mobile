import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ApprovalCard } from "../../components/ApprovalCard";
import { eventBus } from "../../services/eventBus";
import { mockApi } from "../../services/mockApi";
import { Approval } from "../../types/approval";

type TabType = "all" | "approved" | "rejected" | "pending";

const TABS: { key: TabType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "pending", label: "Pending" },
];

const TAB_ACTIVE_COLOR = "#c41230";

export default function DashboardScreen() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Filter approvals based on active tab
  const filteredApprovals = useMemo(() => {
    if (activeTab === "all") {
      return approvals;
    }
    return approvals.filter((approval) => approval.status === activeTab);
  }, [approvals, activeTab]);

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
      <Text style={styles.emptyText}>
        {activeTab === "all"
          ? "No approvals to review"
          : `No ${activeTab} requests`}
      </Text>
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
      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredApprovals}
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#f0f0f0",
  },
  tabActive: {
    backgroundColor: "#c41230",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
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
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
