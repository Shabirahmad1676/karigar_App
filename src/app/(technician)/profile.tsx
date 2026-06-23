import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/store";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { theme } from "../../theme";
import { useRouter } from "expo-router";

export default function TechnicianProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Button label="← Jobs" onPress={() => router.replace("/(technician)")} variant="ghost" style={styles.backBtn} />
          <Text style={styles.headerTitle}>Professional Ledger Portal</Text>
        </View>

        {/* Core Identity Profile */}
        <Card style={styles.profileCard}>
          <Avatar size={72} />
          <View style={styles.infoBlock}>
            <Text style={styles.name}>{user?.name || "Verified Operator"}</Text>
            <Text style={styles.roleBadge}>{user?.role || "TECHNICIAN"}</Text>
          </View>
        </Card>

        {/* Operational Scope */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trade Configurations</Text>
          <Text style={styles.field}><Text style={styles.label}>Account Email: </Text>{user?.email || "operator@karigar.pk"}</Text>
          <Text style={styles.field}><Text style={styles.label}>Operational City: </Text>Mardan, KP</Text>
          <Text style={styles.field}><Text style={styles.label}>Verification Class: </Text>Active Dispatch Fleet</Text>
        </Card>

        {/* Bid Tracking Summary Logs Placeholder Matrix */}
        <Text style={styles.sectionHeader}>Historical Dissemination Log</Text>
        <Card style={styles.logCard}>
          <View style={styles.logHeader}>
            <Text style={styles.logJobTitle}>Bathroom Valve Replacement</Text>
            <Text style={[styles.statusPill, styles.acceptedPill]}>ACCEPTED</Text>
          </View>
          <Text style={styles.logMeta}>Your Rate: Rs. 1,600 • Commission Paid</Text>
        </Card>

        <Card style={styles.logCard}>
          <View style={styles.logHeader}>
            <Text style={styles.logJobTitle}>Main Circuit Breaker Failure</Text>
            <Text style={[styles.statusPill, styles.pendingPill]}>PENDING AUDIT</Text>
          </View>
          <Text style={styles.logMeta}>Your Rate: Rs. 2,500 • Under Evaluation</Text>
        </Card>

        <Button label="Log Out of Fleet Network" onPress={logout} variant="secondary" style={styles.logoutBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  backBtn: { height: 40, paddingHorizontal: 0 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 16 },
  infoBlock: { flex: 1, gap: 4 },
  name: { fontSize: 18, fontWeight: "700", color: theme.colors.textPrimary },
  roleBadge: { fontSize: 11, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.5 },
  detailsCard: { padding: theme.spacing.lg, gap: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.primary, marginBottom: 4, textTransform: "uppercase" },
  field: { fontSize: 14, color: theme.colors.textPrimary },
  label: { fontWeight: "600", color: theme.colors.textSecondary },
  sectionHeader: { fontSize: 14, fontWeight: "700", color: theme.colors.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  logCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  logHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  logJobTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.textPrimary },
  statusPill: { fontSize: 10, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  acceptedPill: { backgroundColor: "#DCFCE7", color: theme.colors.success },
  pendingPill: { backgroundColor: "#FEF3C7", color: "#D9740F" },
  logMeta: { fontSize: 12, color: theme.colors.textSecondary },
  logoutBtn: { marginTop: 24, borderColor: theme.colors.danger }
});