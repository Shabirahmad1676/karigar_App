import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { apiClient } from "../../../lib/apiClient";
import { socket } from "../../../lib/socketClient";
import { Linking } from "react-native";
import Ionicon from "@react-native-vector-icons/ionicons";

interface BidProposal {
  id: number;
  amount: number;
  technicianId: number;
  technician?: {
    name: string;
    phone: string;
    isWorking: boolean; // 👈 Captured from optimized database joins
  };
}

interface JobDetails {
  id: number;
  title: string;
  description: string;
  budget: number;
  status: "PENDING" | "POSTED" | "MATCHED" | "ARRIVED" | "COMPLETED" | "CANCELLED";
  address: string | null;
  imageUrl: string | null;
  bids?: BidProposal[];
}

export default function ClientJobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = parseInt(typeof id === "string" ? id : id[0]);

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  // 1. Fetch the private job allocation profile matching the database ID pointer
  const { data: job, isLoading, error, refetch } = useQuery<JobDetails>({
    queryKey: ["jobDetails", jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response.data;
    },
    enabled: !!jobId,
  });

  // 📦 LIVE SOCKET STREAM: Listen for status milestones triggered by the dispatched technician
  useEffect(() => {
    if (!jobId) return;

    socket.on("bid_accepted", () => refetch());
    socket.on("new_bid", () => refetch());
    
    // Fallback room stream listener synchronization line
    socket.on("job_status_changed", (data: { jobId: number; status: string }) => {
      if (data.jobId === jobId) {
        refetch();
        Alert.alert("Status Updated", `Your technician update status tracker shifted to: ${data.status}`);
      }
    });

    return () => {
      socket.off("bid_accepted");
      socket.off("new_bid");
      socket.off("job_status_changed");
    };
  }, [jobId]);

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
      Alert.alert("Transaction Failed", err.response?.data?.message || "Internal server processing failure.");
    },
  });

  // 📦 NEW MUTATION: Submits the client review rating context to the server matrix ledger
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post(`/jobs/${jobId}/review`, { rating, comment });
    },
    onSuccess: () => {
      Alert.alert("Thank You!", "Your technician review feedback has been safely locked onto the fleet network ledger.");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["jobDetails", jobId] });
    },
    onError: (err: any) => {
      Alert.alert("Review Blocked", err.response?.data?.error || "Unable to submit rating metric targets.");
    },
  });

  // Communication Handshake Protocol via WhatsApp Click-to-Chat deep links
  const handleInitiateChat = (techPhone: string, techName: string) => {
    const cleanPhone = techPhone.replace(/[^0-9]/g, "");
    const textMessage = `Salam ${techName}! I accepted your bid on Karigar for Job Request #${jobId}. Let me know when you can arrive at my address.`;
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(textMessage)}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          return Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`);
        }
      })
      .catch(() => Alert.alert("Connection Broken", "Unable to establish direct communication line channels."));
  };

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backTouchRow}>
          <Ionicon name="arrow-back" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.backTextStr}>Back to Bookings Ledger</Text>
        </TouchableOpacity>

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
          <Text style={styles.meta}><Text style={styles.bold}>Allocated Budget:</Text> Rs. {job.budget.toLocaleString("en-PK")}</Text>
        </Card>

        {/* 📦 PERSISTENT REVIEW CARD: Injected automatically upon completion */}
        {job.status === "COMPLETED" && (
          <Card style={styles.reviewFormCard}>
            <Text style={styles.reviewCardTitle}>⭐ Rate This Karigar</Text>
            <Text style={styles.reviewCardSubtitle}>Provide feedback to maintain trust profiles in Mardan & Peshawar operational sectors.</Text>
            
            {/* Simple Star Selector Interactive Row */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicon 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={32} 
                    color="#EAB308" 
                    style={{ marginRight: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInputText}
              placeholder="Leave an optional comment regarding service performance quality accuracy..."
              placeholderTextColor="#94a3b8"
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <Button 
              label="Submit Fleet Feedback Review" 
              onPress={() => submitReviewMutation.mutate()} 
              loading={submitReviewMutation.isPending}
              style={{ marginTop: 8 }}
            />
          </Card>
        )}

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
                <View style={styles.techTitleLine}>
                  <Text style={styles.techName}>
                    👤 {bid.technician?.name || `Technician Operator #${bid.technicianId}`}
                  </Text>
                  
                  {/* 📦 UX GAIN: Real-time working badge context check indicators */}
                  <View style={[styles.statusMiniBadge, { backgroundColor: bid.technician?.isWorking ? "#FEF3C7" : "#DCFCE7" }]}>
                    <Text style={[styles.statusMiniText, { color: bid.technician?.isWorking ? "#D9740F" : "#15803D" }]}>
                      {bid.technician?.isWorking ? "🟠 On Work" : "🟢 Available"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bidPrice}>
                  Quoted Rate: <Text style={styles.successText}>Rs. {bid.amount.toLocaleString("en-PK")}</Text>
                </Text>
              </View>

              {job.status === "PENDING" ? (
                <Button 
                  label="Accept Hire" 
                  onPress={() => acceptBidMutation.mutate(bid.id)}
                  loading={acceptBidMutation.isPending}
                  style={styles.acceptBtn}
                />
              ) : (
                // Reveal WhatsApp Chat integration link once matched or arrived
                (job.status === "MATCHED" || job.status === "ARRIVED") && (
                  <Button 
                    label="💬 Chat Now" 
                    onPress={() => handleInitiateChat(bid.technician?.phone || "", bid.technician?.name || "Specialist")}
                    style={[styles.acceptBtn, { backgroundColor: "#25D366" }]} 
                  />
                )
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
  backTouchRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start" },
  backTextStr: { fontSize: 14, fontWeight: "600", color: theme.colors.textPrimary },
  card: { padding: theme.spacing.lg, marginBottom: 20 },
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
  bidInfo: { flex: 1, gap: 4 },
  techTitleLine: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  techName: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },
  statusMiniBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusMiniText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  bidPrice: { fontSize: 13, color: theme.colors.textSecondary },
  successText: { color: theme.colors.success, fontWeight: "700" },
  acceptBtn: { height: 40, paddingHorizontal: 16, borderRadius: 10 },
  errorText: { color: theme.colors.danger, textAlign: "center" },
  
  // 📦 REVIEW COMPONENT FORM STYLING
  reviewFormCard: { padding: 20, borderColor: theme.colors.primary, borderWidth: 1, backgroundColor: "#FFF", borderRadius: 16, marginBottom: 24 },
  reviewCardTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 4 },
  reviewCardSubtitle: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  starRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  reviewInputText: { width: "100%", height: 64, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: "#1e293b", textAlignVertical: "top", marginBottom: 12 }
});