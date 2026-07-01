import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/store";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { theme } from "../../theme";
import { useRouter } from "expo-router";
import Ionicon from "@react-native-vector-icons/ionicons";

export default function TechnicianProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const technicianProfile = user as any;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
         
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>

        {/* Identity Card */}
        <Card style={styles.profileCard}>
          <Avatar size={72} />
          <View style={styles.infoBlock}>
            <Text style={styles.name}>{technicianProfile?.name || "Active Operator"}</Text>
            <View style={styles.verifiedBadgeRow}>
              <Ionicon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.verifiedText}>
                {technicianProfile?.verificationStatus || "VERIFIED"} OPERATOR
              </Text>
            </View>
          </View>
        </Card>

        {/* Configurations Display */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trade Configurations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>System ID Key:</Text>
            <Text style={styles.valueCode}>{technicianProfile?.customId?.split('@')[0] || "KG-GEN-2026-001"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fleet Account Tier:</Text>
            <Text style={[styles.valueText, {fontWeight:"700", color: theme.colors.primary}]}>
              {technicianProfile?.tier || "FREE DISPATCH"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Registered Phone:</Text>
            <Text style={styles.valueText}>{technicianProfile?.phone || "No Phone Synced"}</Text>
          </View>
        </Card>

        {/* Ledger History Redirection Button */}
        <TouchableOpacity 
          style={styles.historyMenuRow} 
          onPress={() => router.push("/(technician)/history")}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <Ionicon name="time-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.menuText}>View My Complete Earnings History</Text>
          </View>
          <Ionicon name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>

        <Button label="Log Out of Fleet Network" onPress={logout} variant="secondary" style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: theme.spacing.xl, borderRadius: 16, marginBottom: 16, backgroundColor: theme.colors.surface },
  infoBlock: { flex: 1, justifyContent: "center" },
  name: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 4 },
  verifiedBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  verifiedText: { fontSize: 11, fontWeight: "700", color: "#15803D", letterSpacing: 0.5 },
  detailsCard: { padding: theme.spacing.xl, borderRadius: 16, backgroundColor: theme.colors.surface, gap: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.background, paddingBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  valueText: { fontSize: 14, fontWeight: "500", color: theme.colors.textPrimary },
  valueCode: { fontSize: 14, fontFamily: "monospace", fontWeight: "700", color: theme.colors.primary, backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  logoutBtn: { width: "100%", height: 50, borderRadius: 12, borderColor: theme.colors.danger, marginTop: 8 },
  historyMenuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 24 },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuText: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
});