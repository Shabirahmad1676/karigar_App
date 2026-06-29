import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

// 📦 UPGRADED: Added "ARRIVED" to the strict compile-time status map signature
export type JobStatusType = "PENDING" | "POSTED" | "MATCHED" | "ARRIVED" | "COMPLETED" | "CANCELLED";

interface BadgeProps {
  status: JobStatusType;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "PENDING":
        return { bg: "#FEF3C7", text: "#D9740F" };
      case "POSTED":
        return { bg: theme.colors.primaryMuted, text: theme.colors.primary };
      case "MATCHED":
        return { bg: "#E0F2FE", text: "#0284C7" };
      // 📦 NEW OPERATIONS TARGET STYLE
      case "ARRIVED":
        return { bg: "#E0F2FE", text: theme.colors.primary }; // Distinct design accent color
      case "COMPLETED":
        return { bg: "#DCFCE7", text: theme.colors.success };
      case "CANCELLED":
        return { bg: "#FEE2E2", text: theme.colors.danger };
      default:
        return { bg: theme.colors.border, text: theme.colors.textSecondary };
    }
  };

  const config = getBadgeConfig();

  // 🛠️ STYLE FIX: Replaced invalid 'background' layout indicator property with 'backgroundColor'
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 99,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
  },
});