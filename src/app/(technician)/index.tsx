import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient";
import { useRouter } from "expo-router";

interface AvailableJob {
  id: number;
  title: string;
  description: string;
  budget: number;
  address: string | null;
  service: { name: string; category: string };
}

export default function TechnicianDashboard()  {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState<{ [key: number]: string }>({});

  // 1. Fetch available jobs using backend query targets
  const { data: jobs, isLoading, error, refetch } = useQuery<AvailableJob[]>({
    queryKey: ["availableJobs"],
    queryFn: async () => {
      // In production, update this endpoint to view unassigned public jobs
      const response = await apiClient.get("/services"); 
      return response.data;
    },
  });

  // 2. Setup Mutation pattern to fire isolated POST bids cleanly
  const placeBidMutation = useMutation({
    mutationFn: async ({ jobId, amount }: { jobId: number; amount: number }) => {
      return await apiClient.post(`/bids/${jobId}`, { amount });
    },
    onSuccess: () => {
      Alert.alert("Bid Placed", "Your competitive rate has been broadcast to the client.");
      queryClient.invalidateQueries({ queryKey: ["availableJobs"] });
    },
    onError: (err: any) => {
      Alert.alert("Error", err.response?.data?.error || "Failed to submit bid payload.");
    },
  });

  const handleBidSubmit = (jobId: number) => {
    const amount = parseInt(bidAmount[jobId] || "");
    if (!amount || amount <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid rate amount in PKR.");
      return;
    }
    placeBidMutation.mutate({ jobId, amount });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Karigar Dashboard</Text>
        <Text style={styles.subtitle}>Browse active marketplace requests across Pakistan</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.jobCard}>
              <Text style={styles.category}>{item.service?.category || "Maintenance"}</Text>
              <Text style={styles.jobTitle}>{item.title || "Urgent Maintenance Job"}</Text>
              <Text style={styles.desc}>{item.description || "No problem statement supplied."}</Text>
              <Text style={styles.meta}><Text style={styles.bold}>Address:</Text> {item.address || "Mardan, KP"}</Text>
              <Text style={styles.budget}>Target Budget: Rs. {item.budget || "1,500"}</Text>

              <View style={styles.bidRow}>
                <Input
                  placeholder="Your Rate (Rs.)"
                  value={bidAmount[item.id] || ""}
                  onChangeText={(text) => setBidAmount({ ...bidAmount, [item.id]: text })}
                  keyboardType="numeric"
                  style={styles.bidInput}
                />
                <Button
                  label="Send Bid"
                  onPress={() => handleBidSubmit(item.id)}
                  style={styles.bidBtn}
                />
              </View>
            </Card>
          )}
        />
      )}
      
      <Button 
        label="Go to My Profile Ledger" 
        onPress={() => router.push("/(technician)/profile")} 
        variant="secondary" 
        style={styles.navBtn} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.xl, backgroundColor: theme.colors.surface },
  title: { fontSize: 24, fontWeight: "700", color: theme.colors.textPrimary },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  loader: { flex: 1, justifyContent: "center" },
  list: { padding: theme.spacing.xl },
  jobCard: { marginBottom: theme.spacing.md, padding: theme.spacing.lg },
  category: { fontSize: 11, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase" },
  jobTitle: { fontSize: 16, fontWeight: "700", marginVertical: 4, color: theme.colors.textPrimary },
  desc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  meta: { fontSize: 13, color: theme.colors.textPrimary, marginBottom: 4 },
  bold: { fontWeight: "600" },
  budget: { fontSize: 14, fontWeight: "700", color: theme.colors.success, marginBottom: 12 },
  bidRow: { flexDirection: "row", gap: 12, alignItems: "center", marginTop: 8 },
  bidInput: { flex: 1, marginBottom: 0 },
  bidBtn: { height: 48, paddingHorizontal: 16 },
  navBtn: { margin: theme.spacing.xl }
});