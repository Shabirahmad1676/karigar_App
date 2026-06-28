import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  const buttonStyles = [
    styles.baseButton,
    isPrimary && styles.primary,
    isSecondary && styles.secondary,
    variant === "ghost" && styles.ghost,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    isPrimary && styles.textPrimary,
    isSecondary && styles.textSecondary,
    variant === "ghost" && styles.textGhost,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.surface : theme.colors.primary} />
      ) : (
        <Text style={textStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { 
    backgroundColor: theme.colors.primaryMuted, 
    borderWidth: 1, 
    borderColor: theme.colors.border 
  },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  baseText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  textPrimary: { color: theme.colors.surface },
  textSecondary: { color: theme.colors.primary },
  textGhost: { color: theme.colors.textSecondary },
});