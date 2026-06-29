import React from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { apiClient } from "../../lib/apiClient";
import { useRouter } from "expo-router";
import Ionicon from "@react-native-vector-icons/ionicons";

interface HistoricalJob {
  id: number;
  title: string;
  budget: number;
  address: string | null;
  updatedAt: string;
  status: "COMPLETED" | "CANCELLED";
}

export default function TechnicianHistoryScreen() {
  const router = useRouter();

  // Fetches only non-active completed work ledgers for this technician
  const { data: historyLog, isLoading, error, refetch, isRefetching } = useQuery<HistoricalJob[]>({
    queryKey: ["technicianJobHistory"],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/my"); // Calls the unified user assignment profile route
      // Filter out pending/matched states to isolate historical results
      return response.data.filter((j: any) => j.status === "COMPLETED" || j.status === "CANCELLED");
    },
  });

  // Calculate aggregate gross payout figures
  const totalEarnings = historyLog?.reduce((sum, job) => job.status === "COMPLETED" ? sum + job.budget : sum, 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Back Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings History</Text>
      </View>

      {/* Aggregate Earnings Overview Panel */}
      <Card style={styles.earningsSummaryCard}>
        <Text style={styles.summaryLabel}>TOTAL WORK COMPLETED</Text>
        <Text style={styles.summaryValue}>Rs. {totalEarnings.toLocaleString("en-PK")}</Text>
        <View style={styles.summarySubRow}>
          <Ionicon name="ribbon-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.summarySubText}>{historyLog?.length || 0} Successful Dispatches</Text>
        </View>
      </Card>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.errorText}>Unable to load job histories. Pull to try again.</Text>
      ) : historyLog && historyLog.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicon name="receipt-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No Historical Entries</Text>
          <Text style={styles.emptySubtitle}>Completed marketplace jobs and payouts will generate ledger items here.</Text>
        </View>
      ) : (
        <FlatList
          data={historyLog}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.historyCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.jobId}>JOB #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === "COMPLETED" ? "#DCFCE7" : "#FEE2E2" }]}>
                  <Text style={[styles.statusText, { color: item.status === "COMPLETED" ? "#15803D" : "#B91C1C" }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.jobAddress} numberOfLines={1}>📍 {item.address || "Mardan Sector"}</Text>
              
              <View style={styles.divider} />

              <View style={styles.payoutRow}>
                <Text style={styles.dateLabel}>
                  Finished: {new Date(item.updatedAt).toLocaleDateString("en-PK", { day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.payoutValue}>+ Rs. {item.budget.toLocaleString("en-PK")}</Text>
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  earningsSummaryCard: { margin: 16, padding: 20, backgroundColor: theme.colors.primaryMuted, borderColor: "transparent", borderRadius: 16 },
  summaryLabel: { fontSize: 10, fontWeight: "800", color: theme.colors.primary, letterSpacing: 0.8, marginBottom: 4 },
  summaryValue: { fontSize: 28, fontWeight: "800", color: theme.colors.primary, marginBottom: 6 },
  summarySubRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  summarySubText: { fontSize: 13, fontWeight: "600", color: theme.colors.textPrimary },
  listContainer: { padding: 16, paddingTop: 0, paddingBottom: 40 },
  historyCard: { backgroundColor: "#FFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  jobId: { fontSize: 11, fontFamily: "monospace", fontWeight: "700", color: "#94a3b8" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  jobTitle: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 4 },
  jobAddress: { fontSize: 12, color: "#6b7280", marginBottom: 12 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginBottom: 12 },
  payoutRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateLabel: { fontSize: 12, color: "#9ca3af", fontWeight: "500" },
  payoutValue: { fontSize: 15, fontWeight: "700", color: "#10b981" },
  errorText: { color: theme.colors.danger, textAlign: "center", marginTop: 20 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginTop: 12, marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 18 }
});