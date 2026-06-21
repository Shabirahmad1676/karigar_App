import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity 
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import {SafeAreaView} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { Badge, JobStatusType } from "../../components/ui/Badge";
import { apiClient } from "../../lib/apiClient";
import { useAuth } from "../../features/auth/store";

// Interface reflecting the updated backend schema fields
interface JobBooking {
  id: number;
  title: string;
  description: string;
  budget: number;
  status: JobStatusType;
  address: string | null;
  createdAt: string;
  service: {
    id: number;
    name: string;
    category: string;
  };
}

export default function BookingsScreen() {
  const router = useRouter();
  const { isGuest, token } = useAuth();

  // React Query fetching client's private ledger board history
  const { data: bookings, isLoading, error, refetch, isRefetching } = useQuery<JobBooking[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/my");
      return response.data;
    },
    // Only fire request if the user is verified and has a token (not a guest)
    enabled: !isGuest && !!token,
  });

  const handleBookingPress = (jobId: number) => {
    router.push({
      pathname: "/(client)/jobs/[id]",
      params: { id: jobId }
    });
  };

  // Human-readable date-formatting localized utility helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Render state for anonymous/guest profiles bypassing authentication gates
  if (isGuest) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.infoEmoji}>🔒</Text>
          <Text style={styles.titleCenter}>Track Your Bookings</Text>
          <Text style={styles.subtitleCenter}>
            Please log in or create an account to view your active job orders, match fees, and technician profiles.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Screen Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>Real-time tracking of home service requests</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to retrieve booking history. Please check your connection.</Text>
          </View>
        ) : bookings && bookings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.infoEmoji}>📋</Text>
            <Text style={styles.titleCenter}>No Bookings Yet</Text>
            <Text style={styles.subtitleCenter}>
              Your active home requests will appear here. Tap "Post a Job" on the home panel to hire a professional.
            </Text>
          </View>
        ) : (
          /* Bookings History Log Matrix */
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.85} 
                onPress={() => handleBookingPress(item.id)}
                style={styles.cardWrapper}
              >
                <Card style={styles.bookingCard}>
                  
                  {/* Header Row: Service Classification + Status Pill Badge */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.serviceCategoryText}>{item.service.category}</Text>
                      <Text style={styles.serviceNameText}>{item.service.name}</Text>
                    </View>
                    <Badge status={item.status} />
                  </View>

                  {/* Core Body Section */}
                  <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>

                  {/* Divider Line */}
                  <View style={styles.divider} />

                  {/* Footer Row: Budget Metrics + Calendar Date stamps */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.budgetText}>
                      Budget: <Text style={styles.budgetAmount}>Rs. {item.budget}</Text>
                    </Text>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                  </View>

                </Card>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: theme.spacing.lg,
  },
  bookingCard: {
    width: "100%",
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  serviceCategoryText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  serviceNameText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  jobTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  jobDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  budgetAmount: {
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    fontSize: theme.typography.fontSizes.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxl,
    textAlign: "center",
  },
  infoEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  titleCenter: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  subtitleCenter: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});