import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet,   
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Animated,
  Image
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { theme } from "../../theme";
import { Card } from "../../components/ui/Card";
import { apiClient } from "../../lib/apiClient";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import Icon from "@react-native-vector-icons/ionicons";

// Updated TypeScript interfaces to strictly match your new backend relationship schema
interface ServiceSubItem {
  id: number;
  name: string;
  priceType: "FIXED" | "CUSTOM";
  isActive: boolean;
}

interface CategoryRelation {
  id: number;
  name: string;
  iconName: string;
  isActive: boolean;
  services: ServiceSubItem[];
}

export default function HomeScreen() {
  const router = useRouter();
  const { executeProtectedAction } = useAuthGuard();
  const [searchQuery, setSearchQuery] = useState("");

  // --- Animation Setup for Page Transition ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();
  }, []);

  // Fetches the structured list of active main categories from the server
  const { data: categories, isLoading, error } = useQuery<CategoryRelation[]>({
    queryKey: ["marketplaceCategories"],
    queryFn: async () => {
      const response = await apiClient.get("/services");
      return response.data;
    }
  });

  const handlePostJobPress = () => {
    executeProtectedAction(() => {
      router.push("/(client)/post-job/details");
    });
  };

  const handleCategoryPress = (categoryId: number) => {
    
      // Direct pass to detail views or filters matching category parameters
      router.push({
        pathname: "/(client)/services/[id]",
        params: { id: categoryId }
      });

  };

  // Modern Premium UI Mocks for Nearby Technicians (Matching AppHome.PNG specs)
  const mockNearbyTechs = [
    { id: 1, name: "Amjad Ali", rating: "4.9", category: "Plumber", city: "Mardan", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    { id: 2, name: "Kamran Khan", rating: "4.8", category: "Electrician", city: "Peshawar", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { id: 3, name: "Zia Ahmad", rating: "4.7", category: "HVAC Tech", city: "Lahore", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* Header App Greeting Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Find a Professional</Text>
            <Text style={styles.subWelcomeText}>Karigar local on-demand service hub</Text>
          </View>
          <View style={styles.notificationMockBadge}>
            <Icon name="notifications-outline" size={22} color={theme.colors.textPrimary} />
            <View style={styles.redDot} />
          </View>
        </View>

        {/* Universal Search Bar */}
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
          
          {/* Section: Main Core Category Sectors */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service Sectors</Text>
            <Text style={styles.sectionSubtitle}>Select a craft sector to explore verified local operators</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>Unable to load available categories. Please check connection.</Text>
          ) : (
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.horizontalListPadding}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.85} onPress={() => handleCategoryPress(item.id)}>
                  {/* Clean, minimalist card geometry that dynamically renders your database-seeded vector icons */}
                  <Card style={styles.categoryCardBox}>
                    <View style={styles.iconCircleWrapper}>
                      <Icon name={item.iconName as any} size={28} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.serviceCountLabel}>{item.services?.length || 0} Specialties</Text>
                  </Card>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Section: Popular Near You Grid Display */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
            <Text style={styles.sectionSubtitle}>Top rated technicians within quick dispatch range</Text>
          </View>

          <FlatList
            data={mockNearbyTechs}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.horizontalListPadding}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.9} onPress={() => executeProtectedAction(() => {})}>
                <Card style={styles.techCardBox}>
                  <Image source={{ uri: item.avatar }} style={styles.techAvatar} />
                  <View style={styles.techBadgeRow}>
                    <Text style={styles.techCategoryBadge}>{item.category}</Text>
                  </View>
                  <Text style={styles.techCardName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.ratingInfoRow}>
                    <Icon name="star" size={13} color="#EAB308" />
                    <Text style={styles.ratingText}>{item.rating} • {item.city}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />

          {/* Prompt Promotional Info Banner */}
          <Card style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>Need an urgent fix?</Text>
            <Text style={styles.bannerDesc}>
              Tap the button below to publish your problem statement instantly onto our dedicated network chains.
            </Text>
          </Card>

        </ScrollView>

        {/* Post a Job Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.85} 
          onPress={handlePostJobPress}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Post a Job</Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcomeText: { fontSize: theme.typography.fontSizes.xxl, fontWeight: "700", color: theme.colors.textPrimary },
  subWelcomeText: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, marginTop: 2 },
  notificationMockBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.surface, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: theme.colors.border },
  redDot: { position: "absolute", top: 11, right: 13, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  searchContainer: { paddingHorizontal: theme.spacing.xl, marginVertical: theme.spacing.md },
  searchInput: { height: 50, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, paddingHorizontal: theme.spacing.md, fontSize: theme.typography.fontSizes.md, color: theme.colors.textPrimary },
  scrollContent: { paddingBottom: 100 },
  sectionHeader: { paddingHorizontal: theme.spacing.xl, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm },
  sectionTitle: { fontSize: theme.typography.fontSizes.lg, fontWeight: "700", color: theme.colors.textPrimary },
  sectionSubtitle: { fontSize: theme.typography.fontSizes.xs, color: theme.colors.textSecondary, marginTop: 2 },
  horizontalListPadding: { paddingLeft: theme.spacing.xl, paddingRight: theme.spacing.sm, paddingVertical: theme.spacing.sm },
  
  // Refactored clean modern layout category boxes matching TaskRabbit specs
  categoryCardBox: { width: 140, height: 155, marginRight: theme.spacing.md, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center", justifyContent: "center", padding: theme.spacing.sm },
  iconCircleWrapper: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: theme.spacing.sm },
  categoryName: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary, textAlign: "center", lineHeight: 18, marginBottom: 2 },
  serviceCountLabel: { fontSize: 10, fontWeight: "600", color: theme.colors.textSecondary },

  // Premium Technician Box display matching screenshot layout rules
  techCardBox: { width: 140, padding: theme.spacing.md, marginRight: theme.spacing.md, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: "center" },
  techAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: theme.spacing.sm, backgroundColor: theme.colors.border },
  techBadgeRow: { backgroundColor: theme.colors.primaryMuted, paddingHorizontal: theme.spacing.sm, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
  techCategoryBadge: { fontSize: 9, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase" },
  techCardName: { fontSize: 13, fontWeight: "700", color: theme.colors.textPrimary },
  ratingInfoRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  ratingText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: "500" },

  bannerCard: { marginHorizontal: theme.spacing.xl, marginTop: theme.spacing.xl, backgroundColor: theme.colors.primaryMuted, borderColor: "transparent", borderRadius: 16 },
  bannerTitle: { fontSize: theme.typography.fontSizes.md, fontWeight: "700", color: theme.colors.primary, marginBottom: theme.spacing.xs },
  bannerDesc: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textPrimary, lineHeight: 20, opacity: 0.9 },
  loader: { marginVertical: theme.spacing.xxl },
  errorText: { marginHorizontal: theme.spacing.xl, color: theme.colors.danger, fontSize: theme.typography.fontSizes.sm, textAlign: "center", marginVertical: theme.spacing.xl },
  fab: { position: "absolute", bottom: 24, right: 24, backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, borderRadius: 99, flexDirection: "row", alignItems: "center", elevation: 6 },
  fabIcon: { color: theme.colors.surface, fontSize: 22, fontWeight: "700", marginRight: theme.spacing.xs, top: -1 },
  fabText: { color: theme.colors.surface, fontSize: theme.typography.fontSizes.md, fontWeight: "700" },
});