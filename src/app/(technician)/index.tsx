import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient";
import { useRouter } from "expo-router";
import Ionicon from "@react-native-vector-icons/ionicons";
import { socket } from "../../lib/socketClient"; 

interface AvailableJob {
  id: number;
  title: string;
  description: string;
  budget: number;
  address: string | null;
  status: "PENDING" | "MATCHED" | "ARRIVED" | "COMPLETED";
  createdAt: string;
  service: {
    id: number;
    name: string;
    category: { name: string };
  };
}

export default function TechnicianDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState<{ [key: number]: string }>({});
  const [loadingAction, setLoadingAction] = useState(false);

  // 1. Live state query to dynamically fetch active assignments
  const { data: activeJob, refetch: refetchActiveJob } = useQuery<AvailableJob | null>({
    queryKey: ["techActiveJob"],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/my");
      const runningJob = response.data.find((j: any) => j.status === "MATCHED" || j.status === "ARRIVED");
      return runningJob || null;
    }
  });

  useEffect(() => {
    socket.on("new_job_available", () => {
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
    });

    socket.on("bid_accepted", () => {
      // Refresh queries immediately when a bid is accepted
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
      refetchActiveJob();
    });

    return () => {
      socket.off("new_job_available");
      socket.off("bid_accepted");
    };
  }, []);

  const { data: jobs, isLoading, error, refetch, isRefetching } = useQuery<AvailableJob[]>({
    queryKey: ["availableJobs"],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/available"); 
      return response.data;
    },
    enabled: !activeJob // Stop polling the marketplace board if the worker is busy on a job site
  });

  const placeBidMutation = useMutation({
    mutationFn: async ({ jobId, amount }: { jobId: number; amount: number }) => {
      return await apiClient.post(`/technicians/bids/${jobId}`, { amount });
    },
    onSuccess: () => {
      Alert.alert("Bid Transmitted", "Your professional quote has been safely broadcast to the client.");
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
    },
    onError: (err: any) => {
      const serverErrorMessage = err.response?.data?.error || err.response?.data?.message || "Unable to complete request.";
      Alert.alert("Bidding Restricted", serverErrorMessage);
    },
  });

  const handleBidSubmit = (jobId: number) => {
    const amount = parseInt(bidAmount[jobId] || "");
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Rate", "Please input a valid target amount in PKR.");
      return;
    }
    placeBidMutation.mutate({ jobId, amount });
  };

  const trackArrival = async () => {
    if (!activeJob) return;
    setLoadingAction(true);
    try {
      await apiClient.post(`/technicians/jobs/${activeJob.id}/arrive`);
      Alert.alert("Arrival Logged", "The client has been notified that you have arrived.");
      refetchActiveJob();
    } catch (err: any) {
      Alert.alert("Sync Failure", err.response?.data?.message || "Network error.");
    } finally { setLoadingAction(false); }
  };

  const trackCompletion = async () => {
    if (!activeJob) return;
    setLoadingAction(true);
    try {
      await apiClient.post(`/technicians/jobs/${activeJob.id}/complete`);
      Alert.alert("Success!", "Job completed. Your account is now open for new listings.");
      
      // Invalidate the history cache row so history.tsx updates instantly
      queryClient.invalidateQueries({ queryKey: ["technicianJobHistory"] });
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
      
      refetchActiveJob();
    } catch (err: any) {
      Alert.alert("Sync Failure", err.response?.data?.message || "Network error.");
    } finally { setLoadingAction(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeJob ? "Active Dispatch" : "Karigar Board"}</Text>
        <Text style={styles.subtitle}>
          {activeJob ? "Your current on-site assignment details" : "Live unassigned marketplace requests"}
        </Text>
      </View>

      {/* CONDITIONAL BRANCH: If a technician is hired, hide the board and lock their view to the active task card */}
      {activeJob ? (
        <ScrollView contentContainerStyle={styles.activeJobContainer}>
          <Card style={styles.dispatchJobCard}>
            <View style={styles.dispatchHeader}>
              <View style={styles.pulseDot} />
              <Text style={styles.dispatchTitle}>IN-PROGRESS DISPATCH WORK</Text>
            </View>
            <Text style={styles.jobTitleText}>{activeJob.title}</Text>
            <Text style={styles.jobAddressText}>📍 {activeJob.address || "Mardan Sector"}</Text>
            <Text style={styles.jobPayText}>Payout Target: <Text style={styles.greenText}>Rs. {activeJob.budget}</Text></Text>
            
            <View style={styles.miniDivider} />

            {loadingAction ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 8 }} />
            ) : activeJob.status === "MATCHED" ? (
              <Button label="📍 Log Arrival At Client Address" onPress={trackArrival} style={styles.arriveBtn} />
            ) : (
              <Button label="✅ Mark Job As Completed Successfully" onPress={trackCompletion} style={styles.completeBtn} />
            )}
          </Card>
        </ScrollView>
      ) : isLoading ? (
        <View style={styles.centeredContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : jobs && jobs.length === 0 ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorTitle}>Marketplace is Quiet</Text>
          <Text style={styles.errorSubtitle}>All incoming bookings have been assigned. Pull down to refresh.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.jobCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.categoryTag}>{item.service?.category?.name || "General"}</Text>
                <Text style={styles.jobIdBadge}>#JOB-{item.id}</Text>
              </View>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
              <Text style={styles.locationText}>📍 {item.address || "Mardan Operational Area"}</Text>
              <View style={styles.divider} />
              <View style={styles.actionWrapper}>
                <Text style={styles.budgetAmount}>Rs. {item.budget.toLocaleString("en-PK")}</Text>
                <View style={styles.inputInteractiveRow}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Offer (Rs.)"
                    value={bidAmount[item.id] || ""}
                    onChangeText={(text) => setBidAmount({ ...bidAmount, [item.id]: text })}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.premiumSendBtn} onPress={() => handleBidSubmit(item.id)}>
                    <Text style={styles.sendBtnText}>Bid</Text>
                  </TouchableOpacity>
                </View>
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  activeJobContainer: { padding: 16 },
  dispatchJobCard: { padding: 20, borderColor: "#cbd5e1", borderLeftWidth: 5, borderLeftColor: theme.colors.primary, backgroundColor: "#FFF", borderRadius: 16 },
  dispatchHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  dispatchTitle: { fontSize: 11, fontWeight: "800", color: "#EF4444", letterSpacing: 0.8 },
  jobTitleText: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  jobAddressText: { fontSize: 14, fontWeight: "500", color: "#475569", marginBottom: 6 },
  jobPayText: { fontSize: 14, color: "#64748b" },
  greenText: { fontWeight: "800", color: "#10b981" },
  miniDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  arriveBtn: { height: 48, backgroundColor: theme.colors.primary, borderRadius: 10 },
  completeBtn: { height: 48, backgroundColor: "#10b981", borderRadius: 10 },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 6 },
  errorSubtitle: { fontSize: 14, color: "#64748b", textAlign: "center" },
  list: { padding: 16 },
  jobCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  categoryTag: { fontSize: 11, fontWeight: "800", color: theme.colors.primary, textTransform: "uppercase" },
  jobIdBadge: { fontSize: 11, fontFamily: "monospace", color: "#94a3b8" },
  jobTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  desc: { fontSize: 14, color: "#475569", marginBottom: 12 },
  locationText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  actionWrapper: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetAmount: { fontSize: 16, fontWeight: "800", color: "#10b981" },
  inputInteractiveRow: { flexDirection: "row", flex: 1, maxWidth: "65%", gap: 8 },
  premiumInput: { flex: 1, height: 44, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12 },
  premiumSendBtn: { height: 44, backgroundColor: theme.colors.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
  sendBtnText: { color: "#FFF", fontWeight: "700" }
});