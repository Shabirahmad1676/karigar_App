import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/store";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { theme } from "../../theme";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/apiClient";
import Ionicon from "@react-native-vector-icons/ionicons";

interface ActiveAssignment {
  id: number;
  title: string;
  address: string | null;
  budget: number;
  status: "MATCHED" | "ARRIVED" | "COMPLETED";
}

export default function TechnicianProfileScreen() {
  const { user, logout, login, token } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const technicianProfile = user as any;

  // 📦 LIVE QUERY: Polls current assigned operational orders if locked on-job
  const { data: activeJob, refetch } = useQuery<ActiveAssignment | null>({
    queryKey: ["techActiveJob"],
    queryFn: async () => {
      // Pulls active matching assignment configurations
      const response = await apiClient.get("/jobs/my"); // Returns bookings list for user context profile
      const runningJob = response.data.find((j: any) => j.status === "MATCHED" || j.status === "ARRIVED");
      return runningJob || null;
    },
    enabled: !!token && technicianProfile?.role === "TECHNICIAN"
  });

  const [loadingAction, setLoadingAction] = useState(false);

  // 📦 MUTATION: Progresses workflow state to ARRIVED
  const trackArrival = async () => {
    if (!activeJob) return;
    setLoadingAction(true);
    try {
      await apiClient.post(`/technicians/jobs/${activeJob.id}/arrive`);
      Alert.alert("Arrival Logged", "The client has been updated that you have entered the site coordinates.");
      refetch();
      // Hydrate global memory context parameters safely
      if(user) await login(token!, { ...user, isWorking: true });
    } catch (err: any) {
      Alert.alert("Sync Failure", err.response?.data?.message || "Internal network error.");
    } finally { setLoadingAction(false); }
  };

  // 📦 MUTATION: Complete the ticket lifecycle, unlocking free restrictions
  const trackCompletion = async () => {
    if (!activeJob) return;
    setLoadingAction(true);
    try {
      await apiClient.post(`/technicians/jobs/${activeJob.id}/complete`);
      Alert.alert("Engagement Completed!", "Excellent work. Your profile lock has been cleanly lifted for future board bookings.");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
      if(user) await login(token!, { ...user, isWorking: false }); // Unlocks bidding row constraints
    } catch (err: any) {
      Alert.alert("Sync Failure", err.response?.data?.message || "Internal network error.");
    } finally { setLoadingAction(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
         
        {/* Navigation Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace("/(technician)")} style={styles.backTouch}>
            <Ionicon name="arrow-back" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.backText}>Jobs Board</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Console</Text>
        </View>

        {/* Identity Card */}
        <Card style={styles.profileCard}>
          <Avatar size={72} />
          <View style={styles.infoBlock}>
            <Text style={styles.name}>{technicianProfile?.name || "Active Operator"}</Text>
            <View style={styles.verifiedBadgeRow}>
              <Ionicon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.verifiedText}>
                {technicianProfile?.verificationStatus || "VERIFIED"} OPERATOR
              </Text>
            </View>
          </View>
        </Card>

        {/* 📦 PERSISTENT ACTIVE DISPATCH ASSIGNMENT DRAWER */}
        {activeJob && (
          <Card style={styles.dispatchJobCard}>
            <View style={styles.dispatchHeader}>
              <View style={styles.pulseDot} />
              <Text style={styles.dispatchTitle}>ACTIVE WORK ENGAGEMENT</Text>
            </View>
            <Text style={styles.jobTitleText}>{activeJob.title}</Text>
            <Text style={styles.jobAddressText}>📍 {activeJob.address || "Mardan Operational Sector"}</Text>
            <Text style={styles.jobPayText}>Payout Target: <Text style={{fontWeight:"800", color:"#10b981"}}>Rs. {activeJob.budget}</Text></Text>
            
            <View style={styles.miniDivider} />

            {loadingAction ? (
              <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 8 }} />
            ) : activeJob.status === "MATCHED" ? (
              <Button label="📍 Log Arrival At Client Address" onPress={trackArrival} style={styles.arriveBtn} />
            ) : (
              <Button label="✅ Mark Job As Completed Successfully" onPress={trackCompletion} style={styles.completeBtn} />
            )}
          </Card>
        )}

        {/* Configurations Display */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trade Configurations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>System ID Key:</Text>
            <Text style={styles.valueCode}>{technicianProfile?.customId?.split('@')[0] || "KG-GEN-2026-001"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fleet Account Tier:</Text>
            <Text style={[styles.valueText, {fontWeight:"700", color: theme.colors.primary}]}>
              {technicianProfile?.tier || "FREE DISPATCH"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Registered Phone:</Text>
            <Text style={styles.valueText}>{technicianProfile?.phone || "No Phone Synced"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Work Availability:</Text>
            <Text style={[styles.valueText, { color: activeJob ? "#ef4444" : "#10b981", fontWeight: "700" }]}>
              {activeJob ? "Locked On-Site" : "Standby Fleet Ready"}
            </Text>
          </View>
        </Card>

        {/* Informative Notice */}
        <Card style={styles.noticeCard}>
          <Ionicon name="information-circle-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.noticeText}>
            Bidding operational rules enforce a single concurrent ticket workflow strategy across Mardan/Peshawar zones for free accounts.
          </Text>
        </Card>

        
          <TouchableOpacity 
  style={styles.historyMenuRow} 
  onPress={() => router.push("/(technician)/history")}
  activeOpacity={0.7}
>
  <View style={styles.menuLeft}>
    <Ionicon name="time-outline" size={22} color={theme.colors.primary} />
    <Text style={styles.menuText}>View My Complete Earnings History</Text>
  </View>
  <Ionicon name="chevron-forward" size={18} color="#94a3b8" />
</TouchableOpacity>
        

        <Button label="Log Out of Fleet Network" onPress={logout} variant="secondary" style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backTouch: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { fontSize: 15, fontWeight: "600", color: theme.colors.textPrimary },
  headerTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.textSecondary },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: theme.spacing.xl, borderRadius: 16, marginBottom: 16, backgroundColor: theme.colors.surface },
  infoBlock: { flex: 1, justifyContent: "center" },
  name: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 4 },
  verifiedBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  verifiedText: { fontSize: 11, fontWeight: "700", color: "#15803D", letterSpacing: 0.5 },
  
  // 📦 SPECIAL LIFE STEPS CONTAINER STYLING:
  dispatchJobCard: { padding: 18, borderColor: "#cbd5e1", borderLeftWidth: 5, borderLeftColor: theme.colors.primary, backgroundColor: "#FFF", borderRadius: 16, marginBottom: 16 },
  dispatchHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  dispatchTitle: { fontSize: 11, fontWeight: "800", color: "#EF4444", letterSpacing: 0.8 },
  jobTitleText: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  jobAddressText: { fontSize: 13, fontWeight: "500", color: "#475569", marginBottom: 4 },
  jobPayText: { fontSize: 13, color: "#64748b" },
  miniDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  arriveBtn: { height: 44, backgroundColor: theme.colors.primary, borderRadius: 10 },
  completeBtn: { height: 44, backgroundColor: "#10b981", borderRadius: 10 },

  detailsCard: { padding: theme.spacing.xl, borderRadius: 16, backgroundColor: theme.colors.surface, gap: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.background, paddingBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  valueText: { fontSize: 14, fontWeight: "500", color: theme.colors.textPrimary },
  valueCode: { fontSize: 14, fontFamily: "monospace", fontWeight: "700", color: theme.colors.primary, backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  noticeCard: { flexDirection: "row", alignItems: "center", padding: theme.spacing.lg, borderRadius: 12, backgroundColor: theme.colors.primaryMuted, borderWidth: 0, marginBottom: 24 },
  noticeText: { flex: 1, fontSize: 12, color: theme.colors.textPrimary, lineHeight: 18 },
  logoutBtn: { width: "100%", height: 50, borderRadius: 12, borderColor: theme.colors.danger },
  historyMenuRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#FFF",
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#e2e8f0",
  marginBottom: 16
},
menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
menuText: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
});