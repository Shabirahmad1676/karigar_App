import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { theme } from "../../theme";

export const Card: React.FC<ViewProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.cardRadius, // Enforces the 20px radius requirement
    padding: theme.spacing.lg,
    borderWidth: 1,
    // Soft UI Shadow architecture
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
}); 