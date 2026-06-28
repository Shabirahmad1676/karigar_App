import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { apiClient } from "../../../lib/apiClient";

interface BidProposal {
  id: number;
  amount: number;
  technicianId: number;
  technician?: {
    name: string;
    phone: string;
  };
}

interface JobDetails {
  id: number;
  title: string;
  description: string;
  budget: number;
  status: "PENDING" | "POSTED" | "MATCHED" | "COMPLETED" | "CANCELLED";
  address: string | null;
  imageUrl: string | null;
  bids?: BidProposal[];
}

export default function ClientJobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = parseInt(typeof id === "string" ? id : id[0]);

  // 1. Fetch the private job allocation profile matching the database ID pointer
  const { data: job, isLoading, error } = useQuery<JobDetails>({
    queryKey: ["jobDetails", jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
  });

  // 2. Setup the transaction mutation target pointing directly to acceptBid
  const acceptBidMutation = useMutation({
   mutationFn: async (bidId: number) => {
  return await apiClient.post(`/jobs/bids/${jobId}/accept/${bidId}`);
},
    onSuccess: () => {
      Alert.alert("Success", "Bid accepted successfully! The assignment is finalized.");
      queryClient.invalidateQueries({ queryKey: ["jobDetails", jobId] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
    onError: (err: any) => {
          // console.error("❌ CRASH INSIDE ACCEPT_BID:", err);
      Alert.alert("Transaction Failed", err.response?.data?.message || "Internal server processing failure.");
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Unable to locate this maintenance profile statement.</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 12 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Navigation Action Row */}
        <Button label="← Back to Bookings Ledger" onPress={() => router.back()} variant="ghost" style={styles.backBtn} />

        {/* Core Scope Overview Box */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.jobId}>Job Request #{job.id}</Text>
            <Badge status={job.status} />
          </View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.description}>{job.description}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.meta}><Text style={styles.bold}>Deployment Area:</Text> {job.address || "None Specified"}</Text>
          <Text style={styles.meta}><Text style={styles.bold}>Allocated Budget:</Text> Rs. {job.budget}</Text>
        </Card>

        {/* Technician Proposals Sub-Section Matrix */}
        <Text style={styles.sectionTitle}>Responding Fleet Bid Matrix</Text>
        
        {!job.bids || job.bids.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>⏳ Waiting for local specialist operators to evaluate your listing...</Text>
          </Card>
        ) : (
          job.bids.map((bid) => (
            <Card key={bid.id} style={styles.bidCard}>
              <View style={styles.bidInfo}>
                <Text style={styles.techName}>
                  👤 {bid.technician?.name || `Technician Operator #${bid.technicianId}`}
                </Text>
                <Text style={styles.bidPrice}>
                  Quoted Rate: <Text style={styles.successText}>Rs. {bid.amount.toLocaleString("en-PK")}</Text>
                </Text>
              </View>

              {/* Reveal hire buttons if the root job posting state is PENDING */}
              {job.status === "PENDING" && (
                <Button 
                  label="Accept Hire" 
                  onPress={() => acceptBidMutation.mutate(bid.id)}
                  loading={acceptBidMutation.isPending}
                  style={styles.acceptBtn}
                />
              )}
            </Card>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  scrollContent: { padding: theme.spacing.xl },
  backBtn: { alignSelf: "flex-start", paddingHorizontal: 0, marginBottom: 16 },
  card: { padding: theme.spacing.lg, marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  jobId: { fontSize: 12, fontWeight: "700", color: theme.colors.textSecondary, textTransform: "uppercase" },
  title: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 8 },
  description: { fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22, marginBottom: 12 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  meta: { fontSize: 14, color: theme.colors.textPrimary, marginBottom: 6 },
  bold: { fontWeight: "600", color: theme.colors.textSecondary },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  emptyCard: { padding: 20, alignItems: "center" },
  emptyText: { color: theme.colors.textSecondary, fontSize: 13, textAlign: "center" },
  bidCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  bidInfo: { flex: 1, gap: 2 },
  techName: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },
  bidPrice: { fontSize: 13, color: theme.colors.textSecondary },
  successText: { color: theme.colors.success, fontWeight: "700" },
  acceptBtn: { height: 40, paddingHorizontal: 16 },
  errorText: { color: theme.colors.danger, textAlign: "center" }
});