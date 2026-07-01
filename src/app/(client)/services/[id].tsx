import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { apiClient } from "../../../lib/apiClient";
import { useAuthGuard } from "../../../hooks/useAuthGuard";
import { useJobFormStore } from "../../../features/services/postJobStore";
import Icon from "@react-native-vector-icons/ionicons";

interface ServiceSubItem {
  id: number;
  name: string;
  priceType: "FIXED" | "CUSTOM";
  isActive: boolean;
  categoryId: number;
}

interface CategoryDetails {
  id: number;
  name: string;
  iconName: string;
  isActive: boolean;
  services: ServiceSubItem[];
}

const SUB_SERVICE_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80", 
  2: "https://images.unsplash.com/photo-1615821372661-d7768cb1b2cb?w=400&q=80", 
  3: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&q=80", 
  4: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400&q=80", 
  5: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80", 
  6: "https://images.unsplash.com/photo-1565538810844-1e11941c6c07?w=400&q=80", 
  7: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80", 
  8: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&q=80", 
  9: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80", 
  10: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?w=400&q=80", 
  11: "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?w=400&q=80", 
  12: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80", 
  13: "https://images.unsplash.com/photo-1509783236416-c9ad59bbe472?w=400&q=80", 
  14: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", 
  15: "https://images.unsplash.com/photo-1581141872131-84d1d685098a?w=400&q=80", 
  16: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80", 
  17: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?w=400&q=80", 
  18: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80", 
  19: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80", 
  20: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80", 
  21: "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=400&q=80", 
  22: "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=400&q=80", 
  23: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400&q=80", 
  24: "https://images.unsplash.com/photo-1595275372297-f0d1450a4d95?w=400&q=80", 
};

const DEFAULT_SERVICE_IMAGE = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80";

export default function ServiceCategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { executeProtectedAction } = useAuthGuard();
  const { updateFields } = useJobFormStore();
  const categoryId = parseInt(typeof id === "string" ? id : id[0]);

  const { data: categoryData, isLoading, error } = useQuery<CategoryDetails>({
    queryKey: ["categoryDetails", categoryId],
    queryFn: async () => {
      const response = await apiClient.get(`/services/${categoryId}`);
      return response.data;
    },
    enabled: !!categoryId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading services…</Text>
      </SafeAreaView>
    );
  }

  if (error || !categoryData) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.errorIconWrap}>
          <Icon name="alert-circle-outline" size={32} color={theme.colors.danger} />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>Service classification data could not be verified.</Text>
        <Button label="Go Back" onPress={() => router.back()} style={{ marginTop: theme.spacing.xl }} />
      </SafeAreaView>
    );
  }

  const handleSelectSubService = (subService: ServiceSubItem) => {
    executeProtectedAction(() => {
      updateFields({
        serviceId: subService.id,
        title: subService.name,
      });
      router.push("/(client)/post-job/details");
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backTouch} onPress={() => router.back()} activeOpacity={0.6}>
          <Icon name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryData.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={categoryData.services}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollListContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.heroSection}>
            <Text style={styles.sectionEyebrow}>{categoryData.services.length} Options Available</Text>
            <Text style={styles.sectionSubtitle}>
              Select a specialized field below to automatically customize your job posting scope for local Mardan specialists.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleSelectSubService(item)}
            style={styles.interactiveRowWrapper}
          >
            <Card style={styles.serviceCard}>
              <Image
                source={{ uri: SUB_SERVICE_IMAGES[item.id] || DEFAULT_SERVICE_IMAGE }}
                style={styles.serviceImage}
                resizeMode="cover"
              />
              <View style={styles.serviceMetaBlock}>
                <Text style={styles.serviceNameText} numberOfLines={2}>{item.name}</Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      item.priceType === "FIXED" ? styles.badgeFixed : styles.badgeCustom,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        item.priceType === "FIXED" ? styles.badgeFixedText : styles.badgeCustomText,
                      ]}
                    >
                      {item.priceType === "FIXED" ? "Fixed Rate" : "Custom Quote"}
                    </Text>
                  </View>
                  <View style={styles.forwardArrowCircle}>
                    <Icon name="chevron-forward" size={14} color={theme.colors.primary} />
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: theme.typography.lineHeights.normal,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    height: 56,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backTouch: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  scrollListContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  heroSection: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xs,
  },
  sectionEyebrow: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.normal,
  },
  interactiveRowWrapper: {
    marginBottom: theme.spacing.md,
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.cardRadius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  serviceImage: {
    width: 100,
    height: 100,
  },
  serviceMetaBlock: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
  },
  serviceNameText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.normal,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 6,
  },
  badgeFixed: {
    backgroundColor: theme.colors.primaryMuted,
  },
  badgeCustom: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  badgeFixedText: {
    color: theme.colors.primary,
  },
  badgeCustomText: {
    color: theme.colors.textSecondary,
  },
  forwardArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});