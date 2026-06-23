import React from "react";
import { View, TextInput, Text, StyleSheet, TextInputProps } from "react-native";
import { theme } from "../../theme";
import Ionicons from "@react-native-vector-icons/ionicons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string; // Appended property to dynamically accept vector glyph definitions
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon as any} 
            size={20} 
            color="#888" 
            style={styles.iconStyles} 
          />
        )}
        <TextInput
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
  },
  iconStyles: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  inputError: { borderColor: theme.colors.danger, borderWidth: 1 },
  errorText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
});