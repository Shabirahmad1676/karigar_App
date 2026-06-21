import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

export type JobStatusType = "PENDING" | "POSTED" | "MATCHED" | "COMPLETED" | "CANCELLED";

interface BadgeProps {
  status: JobStatusType;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "PENDING":
        return { bg: "#FEF3C7", text: "#D9740F" }; // Warning Soft Yellow
      case "POSTED":
        return { bg: theme.colors.primaryMuted, text: theme.colors.primary };
      case "MATCHED":
        return { bg: "#E0F2FE", text: "#0284C7" }; // Info Soft Blue
      case "COMPLETED":
        return { bg: "#DCFCE7", text: theme.colors.success };
      case "CANCELLED":
        return { bg: "#FEE2E2", text: theme.colors.danger };
      default:
        return { bg: theme.colors.border, text: theme.colors.textSecondary };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { background: config.bg }]}>
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