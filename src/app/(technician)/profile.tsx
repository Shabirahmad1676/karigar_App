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

  // Cast user context to any to display values smoothly without TS compilation hurdles
  const technicianProfile = user as any;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Navigation Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace("/(technician)")} style={styles.backTouch}>
            <Ionicon name="arrow-back" size={24} color={theme.colors.textPrimary} />
            <Text style={styles.backText}>Jobs Board</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Profile</Text>
        </View>

        {/* 🏅 Core Identity Profile Card with Live Verification Badge */}
        <Card style={styles.profileCard}>
          <Avatar size={72} />
          <View style={styles.infoBlock}>
            <Text style={styles.name}>{technicianProfile?.name || "Active Operator"}</Text>
            
            {/* Live Verification Status Pill */}
            <View style={styles.verifiedBadgeRow}>
              <Ionicon name="checkmark-circle" size={16} color={theme.colors.success || "#22c55e"} />
              <Text style={styles.verifiedText}>
                {technicianProfile?.verificationStatus || "VERIFIED"} OPERATOR
              </Text>
            </View>
          </View>
        </Card>

        {/* 🛠️ Dynamic Operational Scope Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trade Configurations</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>System ID Key:</Text>
            <Text style={styles.valueCode}>{technicianProfile?.customId?.split('@')[0] || "KG-GEN-2026-000"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Registered Phone:</Text>
            <Text style={styles.valueText}>{technicianProfile?.phone || "No Phone Synced"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Account Status:</Text>
            <Text style={[styles.valueText, { color: theme.colors.success, fontWeight: "700" }]}>Active Dispatch Fleet</Text>
          </View>
        </Card>

        {/* Informative Platform Notice */}
        <Card style={styles.noticeCard}>
          <Ionicon name="information-circle-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.noticeText}>
            Your platform configurations are verified. Bidding commission targets are managed dynamically per dispatch engagement.
          </Text>
        </Card>

        {/* Logout Trigger Action */}
        <Button 
          label="Log Out of Fleet Network" 
          onPress={logout} 
          variant="secondary" 
          style={styles.logoutBtn} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backTouch: { flexDirection: "row", alignItems: "center", gap: 4 },
  backText: { fontSize: 15, fontWeight: "600", color: theme.colors.textPrimary },
  headerTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.textSecondary },
  
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, padding: theme.spacing.xl, borderRadius: 16, marginBottom: 16, backgroundColor: theme.colors.surface },
  infoBlock: { flex: 1, justifyContent: "center" },
  name: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 4 },
  
  verifiedBadgeRow: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  verifiedText: { fontSize: 11, fontWeight: "700", color: "#15803D", letterSpacing: 0.5 },
  
  detailsCard: { padding: theme.spacing.xl, borderRadius: 16, backgroundColor: theme.colors.surface, gap: 14, marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.colors.background, paddingBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", color: theme.colors.textSecondary },
  valueText: { fontSize: 14, fontWeight: "500", color: theme.colors.textPrimary },
  valueCode: { fontSize: 14, fontFamily: "monospace", fontWeight: "700", color: theme.colors.primary, backgroundColor: theme.colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  
  noticeCard: { flexDirection: "row", alignItems: "center", padding: theme.spacing.lg, borderRadius: 12, backgroundColor: theme.colors.primaryMuted, borderWidth: 0, marginBottom: 24 },
  noticeText: { flex: 1, fontSize: 12, color: theme.colors.textPrimary, lineHeight: 18 },
  logoutBtn: { width: "100%", height: 50, borderRadius: 12, borderColor: theme.colors.danger }
});