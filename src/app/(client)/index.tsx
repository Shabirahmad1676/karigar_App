import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet,  
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from "react-native";

import {SafeAreaView} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { apiClient } from "../../lib/apiClient";
import { useAuthGuard } from "../../hooks/useAuthGuard";

// Interface mapping database service entity structure
interface ServiceCategory {
  id: number;
  name: string;
  category: string;
  priceType: "FIXED" | "CUSTOM";
  isActive: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { executeProtectedAction } = useAuthGuard();
  const [searchQuery, setSearchQuery] = useState("");

  // React Query fetch mechanism synced with backend service controller endpoint
  const { data: services, isLoading, error } = useQuery<ServiceCategory[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await apiClient.get("/services");
      return response.data;
    }
  });

  const handlePostJobPress = () => {
    // Structural Guard Hook interceptor action
    executeProtectedAction(() => {
      router.push("/(client)/post-job/details");
    });
  };

  const handleCategoryPress = (serviceId: number) => {
    router.push({
      pathname: "/(client)/services/[id]",
      params: { id: serviceId }
    });
  };

  // Helper function to map category names to matching visual icons or emojis
  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case "electrician": return "⚡";
      case "plumber": return "🪠";
      case "hvac tech": return "❄️";
      case "carpenter": return "🪚";
      default: return "🛠️";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header App Greeting bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Find a Professional</Text>
            <Text style={styles.subWelcomeText}>Karigar local on-demand service hub</Text>
          </View>
        </View>

        {/* 1. Universal Search Bar Container */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for plumbers, electricians..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Section: Category Listings */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Sectors</Text>
            <Text style={styles.sectionSubtitle}>Select a craft sector to explore verified local operators</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>Unable to load available services. Please check your network connection.</Text>
          ) : (
            /* 2. Horizontal Scroll of Service Category Cards */
            <FlatList
              data={services}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.horizontalListPadding}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleCategoryPress(item.id)}>
                  <Card style={styles.categoryCard}>
                    <Text style={styles.categoryIcon}>{getCategoryEmoji(item.category)}</Text>
                    <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.priceTagType}>{item.priceType} RATE</Text>
                  </Card>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Prompt Banner Panel context */}
          <Card style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>Need an urgent fix?</Text>
            <Text style={styles.bannerDesc}>
              Tap the button below to publish your problem statement instantly onto our dedicated network chains.
            </Text>
          </Card>

        </ScrollView>

        {/* 3. Post a Job Floating Action Button (FAB) */}
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.85} 
          onPress={handlePostJobPress}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Post a Job</Text>
        </TouchableOpacity>

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
    paddingBottom: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  subWelcomeText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginVertical: theme.spacing.md,
  },
  searchInput: {
    height: 48,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textPrimary,
    // Soft search box shadow metrics
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Provides extra bottom clearance for the floating action element overlay
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  horizontalListPadding: {
    paddingLeft: theme.spacing.xl,
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  categoryCard: {
    width: 140,
    height: 150,
    marginRight: theme.spacing.md,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 18,
  },
  priceTagType: {
    fontSize: 9,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  bannerCard: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primaryMuted,
    borderColor: "transparent",
  },
  bannerTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  bannerDesc: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    opacity: 0.9,
  },
  loader: {
    marginVertical: theme.spacing.xxl,
  },
  errorText: {
    marginHorizontal: theme.spacing.xl,
    color: theme.colors.danger,
    fontSize: theme.typography.fontSizes.sm,
    textAlign: "center",
    marginVertical: theme.spacing.xl,
  },
  /* Floating Action Button Design Architecture */
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 99,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: theme.colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: {
    color: theme.colors.surface,
    fontSize: 22,
    fontWeight: theme.typography.fontWeights.bold,
    marginRight: theme.spacing.xs,
    top: -1, // Adjust micro positioning balance inside circular rendering layout
  },
  fabText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
  },
});