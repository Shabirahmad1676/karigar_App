import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient";
import { useRouter } from "expo-router";
import Ionicon from "@react-native-vector-icons/ionicons";


interface AvailableJob {
  id: number;
  title: string;
  description: string;
  budget: number;
  address: string | null;
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

  const { data: jobs, isLoading, error, refetch, isRefetching } = useQuery<AvailableJob[]>({
    queryKey: ["availableJobs"],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/available"); 
      return response.data;
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: async ({ jobId, amount }: { jobId: number; amount: number }) => {
      return await apiClient.post(`/bids/${jobId}`, { amount });
    },
    onSuccess: () => {
      Alert.alert("Bid Transmitted", "Your professional quote has been safely broadcast to the client.");
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
    },
   onError: (err: any) => {
  // 1. Log the absolute unedited error response out to your terminal 
  console.log("❌ CRITICAL BACKEND RESPONSE OBJECT:", err.response?.data);
  
  // 2. Map all possible response keys so the real error message displays on your screen
  const serverErrorMessage = 
    err.response?.data?.error || 
    err.response?.data?.message || 
    "Unable to complete request payload verification.";

  Alert.alert("Bidding Restricted", serverErrorMessage);
},
  });

  const handleBidSubmit = (jobId: number) => {
    const amount = parseInt(bidAmount[jobId] || "");
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Rate", "Please input a valid target amount in PKR to place your proposal.");
      return;
    }
    placeBidMutation.mutate({ jobId, amount });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Integrated App Header Area */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.title}>Karigar Board</Text>
            <Text style={styles.subtitle}>Live unassigned marketplace requests</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileTriggerBtn} 
            onPress={() => router.push("/(technician)/profile")}
            activeOpacity={0.8}
          >
            <Ionicon name="person-circle-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Ionicon name="cloud-offline-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.errorTitle}>Sync Connection Lost</Text>
          <Text style={styles.errorSubtitle}>Unable to retrieve public leads right now. Verify server availability status.</Text>
          <Button label="Retry Sync Loop" onPress={() => refetch()} variant="primary" style={styles.retryBtn} />
        </View>
      ) : jobs && jobs.length === 0 ? (
        <View style={styles.centeredContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicon name="briefcase-outline" size={32} color={theme.colors.textSecondary} />
          </View>
          <Text style={styles.errorTitle}>Marketplace is Quiet</Text>
          <Text style={styles.errorSubtitle}>All incoming client bookings have been assigned. Pull down to refresh live streams.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <Card style={styles.jobCard}>
              {/* Card Meta Header Stack */}
              <View style={styles.cardHeader}>
                <View style={styles.tagWrapper}>
                  <Text style={styles.categoryTag}>
                    {item.service?.category?.name || "General"}
                  </Text>
                  <Text style={styles.serviceSubTag}>
                    • {item.service?.name}
                  </Text>
                </View>
                <Text style={styles.jobIdBadge}>#JOB-{item.id}</Text>
              </View>

              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
              
              {/* Contextual Placement Information Metrics Block */}
              <View style={styles.locationContainer}>
                <Ionicon name="location-outline" size={16} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.address || "Mardan Operational Area"}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Functional Bidding Quote Interactive Section */}
              <View style={styles.actionWrapper}>
                <View style={styles.budgetDisplayStack}>
                  <Text style={styles.budgetLabel}>CLIENT BUDGET</Text>
                  <Text style={styles.budgetAmount}>Rs. {item.budget.toLocaleString("en-PK")}</Text>
                </View>

                <View style={styles.inputInteractiveRow}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Your Offer (Rs.)"
                    placeholderTextColor="#9ca3af"
                    value={bidAmount[item.id] || ""}
                    onChangeText={(text) => setBidAmount({ ...bidAmount, [item.id]: text })}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.premiumSendBtn} 
                    onPress={() => handleBidSubmit(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.sendBtnText}>Bid</Text>
                    <Ionicon name="chevron-forward" size={14} color="#FFF" />
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
  container: { flex: 1, backgroundColor: "#f8fafc" }, // Clean premium off-white canvas backdrop background
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  profileTriggerBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
  
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 6, textAlign: "center" },
  errorSubtitle: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  retryBtn: { marginTop: 20, width: 160, height: 44, borderRadius: 8 },
  
  list: { padding: 16, paddingBottom: 32 },
  jobCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  tagWrapper: { flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 8 },
  categoryTag: { fontSize: 11, fontWeight: "800", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.5 },
  serviceSubTag: { fontSize: 12, fontWeight: "600", color: "#64748b", marginLeft: 4 },
  jobIdBadge: { fontSize: 11, fontFamily: "monospace", fontWeight: "700", color: "#94a3b8", backgroundColor: "#f8fafc", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  jobTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  desc: { fontSize: 14, color: "#475569", lineHeight: 20, marginBottom: 14 },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  locationText: { fontSize: 13, fontWeight: "500", color: "#64748b" },
  
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  actionWrapper: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  budgetDisplayStack: { flexDirection: "column" },
  budgetLabel: { fontSize: 9, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.5, marginBottom: 2 },
  budgetAmount: { fontSize: 16, fontWeight: "800", color: "#10b981" },
  
  inputInteractiveRow: { flexDirection: "row", alignItems: "center", flex: 1, maxWidth: "65%", gap: 8 },
  premiumInput: { flex: 1, height: 44, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  premiumSendBtn: { height: 44, backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, borderRadius: 10, gap: 4 },
  sendBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" }
});