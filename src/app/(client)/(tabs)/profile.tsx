import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../features/auth/store";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { theme } from "../../../theme";
import { useRouter } from "expo-router";
import Icon from "@react-native-vector-icons/ionicons";

export default function ClientProfileScreen() {
  const router = useRouter();
  const { user, logout, isGuest, token } = useAuth();

  // --- Smooth Entry Page Transition ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  // Structural Isolation fix for Problem 2 (Stops layout data leaks for Guest users)
  if (isGuest || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.centerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconCircleWrapper}>
            <Icon name="person-circle-outline" size={36} color={theme.colors.primary} />
          </View>
          <Text style={styles.titleCenter}>Profile Settings</Text>
          <Text style={styles.subtitleCenter}>
            Please sign in or create an account to manage your settings, view contact history, and customize your profile data.
          </Text>
          <Button label="Sign In / Register" onPress={() => router.push("/(auth)/login")} variant="primary" style={styles.authRedirectBtn} />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Active Logged-In User View State
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.headerTitle}>Account Settings</Text>
        
        <Card style={styles.profileCard}>
          <Avatar size={72} sourceUrl={undefined} />
          <View style={styles.infoBlock}>
            <Text style={styles.name}>{user?.name || "Verified Customer User"}</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.roleBadge}>{user?.role || "CLIENT"}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <View style={styles.fieldRow}>
            <View style={styles.rowHeader}>
              <Icon name="mail-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.label}>Email Reference</Text>
            </View>
            <Text style={styles.valueText} numberOfLines={1}>{user?.email || "Not Provided"}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.fieldRow}>
            <View style={styles.rowHeader}>
              <Icon name="earth-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.label}>Country Jurisdiction</Text>
            </View>
            <Text style={styles.valueText}>Pakistan (PK)</Text>
          </View>
        </Card>

        <Button label="Sign Out from System" onPress={logout} variant="secondary" style={styles.logoutBtn} textStyle={styles.logoutBtnText} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl },
  headerTitle: { fontSize: 26, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.xl },
  profileCard: { flexDirection: "row", alignItems: "center", padding: theme.spacing.lg, borderRadius: 16, gap: 16, marginBottom: theme.spacing.md, borderWidth: 0, backgroundColor: theme.colors.surface, shadowColor: theme.colors.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  infoBlock: { flex: 1, justifyContent: "center" },
  name: { fontSize: theme.typography.fontSizes.lg, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 4 },
  badgeContainer: { alignSelf: "flex-start", backgroundColor: theme.colors.primaryMuted, paddingHorizontal: theme.spacing.sm, paddingVertical: 4, borderRadius: 6 },
  roleBadge: { fontSize: 10, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.6 },
  detailsCard: { padding: theme.spacing.lg, borderRadius: 16, marginBottom: theme.spacing.xl, borderWidth: 0, backgroundColor: theme.colors.surface, shadowColor: theme.colors.cardShadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  fieldRow: { paddingVertical: 4 },
  rowHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  label: { fontSize: theme.typography.fontSizes.xs, fontWeight: "500", color: theme.colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 },
  valueText: { fontSize: theme.typography.fontSizes.md, color: theme.colors.textPrimary, fontWeight: "600", paddingLeft: 20 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm, opacity: 0.6 },
  logoutBtn: { width: "100%", borderColor: theme.colors.danger, borderWidth: 1, borderRadius: theme.spacing.cardRadius || 12, height: 48, backgroundColor: "transparent", marginTop: "auto", marginBottom: theme.spacing.xl },
  logoutBtnText: { color: theme.colors.danger, fontWeight: "700" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: theme.spacing.xxl, backgroundColor: theme.colors.background },
  iconCircleWrapper: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primaryMuted, justifyContent: "center", alignItems: "center", marginBottom: theme.spacing.lg },
  titleCenter: { fontSize: theme.typography.fontSizes.xl, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm, textAlign: "center" },
  subtitleCenter: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: theme.spacing.xl },
  authRedirectBtn: { width: "100%", borderRadius: theme.spacing.cardRadius || 12, height: 48 }
});