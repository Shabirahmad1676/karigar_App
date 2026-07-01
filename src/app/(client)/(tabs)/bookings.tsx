import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "../../../theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge, JobStatusType } from "../../../components/ui/Badge";
import { apiClient } from "../../../lib/apiClient";
import { useAuth } from "../../../features/auth/store";
import { socket } from "../../../lib/socketClient";
import Icon from "@react-native-vector-icons/ionicons";

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
    // CHANGE THIS: Map the actual incoming database object structure
    category: {
      id: number;
      name: string;
      iconName: string;
      isActive: boolean;
    }; 
  };
}

export default function BookingsScreen() {
  const router = useRouter();
  const { isGuest, token } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true })
    ]).start();
  }, []);

  const { data: bookings, isLoading, error, refetch, isRefetching } = useQuery<JobBooking[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      const response = await apiClient.get("/jobs/my");
      return response.data;
    },
    enabled: !isGuest && !!token,
  });

  useEffect(() => {
    if (isGuest || !token) return;

    socket.on("new_bid", (data) => { refetch(); });
    socket.on("bid_accepted", (data) => { refetch(); });

    return () => {
      socket.off("new_bid");
      socket.off("bid_accepted");
    };
  }, [token, isGuest]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  };

  // Bulletproof verification constraint fix for Problem 1
  if (isGuest || !token) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.centerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconCircleWrapper}>
            <Icon name="lock-closed-outline" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.titleCenter}>Account Required</Text>
          <Text style={styles.subtitleCenter}>
            Please log in or create a profile to view active job orders, live technician bids, and status updates on Karigar.
          </Text>
          <Button label="Sign In / Register" onPress={() => router.push("/(auth)/login")} variant="primary" style={styles.authRedirectBtn} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSubtitle}>Real-time tracking of home service requests</Text>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <View style={[styles.iconCircleWrapper, { backgroundColor: theme.colors.primaryMuted }]}><Icon name="alert-circle-outline" size={32} color={theme.colors.danger} /></View>
            <Text style={styles.titleCenter}>Connection Error</Text>
            <Text style={styles.subtitleCenter}>Unable to sync your account request timeline. Please check your network connectivity.</Text>
            <Button label="Retry Connection" onPress={() => refetch()} variant="primary" style={styles.authRedirectBtn} />
          </View>
        ) : bookings && bookings.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.iconCircleWrapper}><Icon name="receipt-outline" size={32} color={theme.colors.primary} /></View>
            <Text style={styles.titleCenter}>No Bookings Yet</Text>
            <Text style={styles.subtitleCenter}>Your submitted requests will appear here. Tap "Post a Job" to connect with professionals.</Text>
            <Button label="Explore Services" onPress={() => router.replace("/(client)")} variant="primary" style={styles.authRedirectBtn} />
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={isRefetching}
            onRefresh={refetch}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.85} onPress={() => router.push({ pathname: "/(client)/jobs/[id]", params: { id: item.id } })} style={styles.cardWrapper}>
                <Card style={styles.bookingCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryInfoStack}>
                      <Text style={styles.serviceCategoryText}>{item.service.category.name}</Text>
                      <Text style={styles.serviceNameText}>{item.service.name}</Text>
                    </View>
                    <Badge status={item.status} />
                  </View>
                  <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.divider} />
                  <View style={styles.cardFooter}>
                    <View style={styles.budgetBox}>
                      <Text style={styles.budgetLabel}>EST. BUDGET</Text>
                      <Text style={styles.budgetAmount}>Rs. {item.budget.toLocaleString("en-PK")}</Text>
                    </View>
                    <View style={styles.dateBox}>
                      <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: 26, fontWeight: "700", color: theme.colors.textPrimary },
  headerSubtitle: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, marginTop: 2 },
  listContent: { padding: theme.spacing.xl, paddingBottom: 40 },
  cardWrapper: { marginBottom: theme.spacing.md },
  bookingCard: { width: "100%", padding: theme.spacing.lg, borderRadius: 16, borderWidth: 0, backgroundColor: theme.colors.surface, shadowColor: theme.colors.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: theme.spacing.md },
  categoryInfoStack: { flex: 1, paddingRight: theme.spacing.sm },
  serviceCategoryText: { fontSize: 10, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.6 },
  serviceNameText: { fontSize: theme.typography.fontSizes.sm, fontWeight: "700", color: theme.colors.textPrimary, marginTop: 2 },
  jobTitle: { fontSize: theme.typography.fontSizes.md, fontWeight: "600", color: theme.colors.textPrimary, marginBottom: 4, marginTop: theme.spacing.xs },
  jobDescription: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: theme.spacing.md },
  divider: { height: 1, backgroundColor: theme.colors.border, marginBottom: theme.spacing.md, opacity: 0.6 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetBox: { flexDirection: "column" },
  budgetLabel: { fontSize: 9, fontWeight: "700", color: theme.colors.textSecondary, letterSpacing: 0.4, marginBottom: 2 },
  budgetAmount: { fontSize: theme.typography.fontSizes.md, fontWeight: "700", color: theme.colors.textPrimary },
  dateBox: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: 6 },
  dateText: { fontSize: 11, fontWeight: "500", color: theme.colors.textSecondary },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: theme.spacing.xxl, backgroundColor: theme.colors.background },
  iconCircleWrapper: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: theme.spacing.lg },
  titleCenter: { fontSize: theme.typography.fontSizes.xl, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm, textAlign: "center" },
  subtitleCenter: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: theme.spacing.xl },
  authRedirectBtn: { width: "100%", borderRadius: theme.spacing.cardRadius || 12, height: 48 }
});