import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { apiClient } from "../../../lib/apiClient";
import { useAuthGuard } from "../../../hooks/useAuthGuard";

// Updated TypeScript interface to handle the new relational backend data schema
interface ServiceDetails {
  id: number;
  name: string;
  priceType: string;
  category: {
    id: number;
    name: string;
    iconName: string;
  };
}

export default function ServiceCategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { executeProtectedAction } = useAuthGuard();
  const serviceId = parseInt(typeof id === "string" ? id : id[0]);

  const { data: service, isLoading, error } = useQuery<ServiceDetails>({
    queryKey: ["serviceDetails", serviceId],
    queryFn: async () => {
      const response = await apiClient.get(`/services/${serviceId}`);
      return response.data;
    },
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Service classification data could not be verified.</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: 12 }} />
      </SafeAreaView>
    );
  }

  const handleBookingTransaction = () => {
    executeProtectedAction(() => {
      router.push("/(client)/post-job/details");
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Button label="← Back to Marketplace" onPress={() => router.back()} variant="ghost" style={styles.backBtn} />

        <Card style={styles.bannerCard}>
          {/* Fix: safely drill into the category name string property */}
          <Text style={styles.categoryTag}>
            {service.category?.name ? service.category.name.toUpperCase() : "MAINTENANCE"}
          </Text>
          <Text style={styles.title}>{service.name}</Text>
          <Text style={styles.billingType}>Billing Structure: {service.priceType} RATE</Text>
        </Card>

        <Text style={styles.sectionHeader}>Available On-Demand Specialists</Text>
        
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            Verified technicians in this sector are ready. Click the button below to publish an active request statement on the network ledger.
          </Text>
          <Button 
            label="📅 Book a Technician Now" 
            onPress={handleBookingTransaction} 
            style={styles.bookBtn}
          />
        </Card>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: theme.spacing.xl },
  backBtn: { alignSelf: "flex-start", paddingHorizontal: 0, marginBottom: 16 },
  bannerCard: { padding: theme.spacing.lg, backgroundColor: theme.colors.primaryMuted, borderColor: "transparent", marginBottom: 24 },
  categoryTag: { fontSize: 11, fontWeight: "700", color: theme.colors.primary, letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginTop: 4, marginBottom: 8 },
  billingType: { fontSize: 13, fontWeight: "600", color: theme.colors.textSecondary },
  sectionHeader: { fontSize: 14, fontWeight: "700", color: theme.colors.textSecondary, textTransform: "uppercase", marginBottom: 12, letterSpacing: 0.5 },
  infoCard: { padding: theme.spacing.lg, alignItems: "center" },
  infoText: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 22, textAlign: "center", marginBottom: 16 },
  bookBtn: { width: "100%" },
  errorText: { color: theme.colors.danger, fontWeight: "600" }
});