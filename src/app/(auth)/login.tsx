import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/store";
import Icon from "@react-native-vector-icons/ionicons";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth(); // Injected global state handler
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "TECHNICIAN">("CLIENT");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const localErrors: typeof errors = {};
    if (role === "CLIENT") {
      if (!email.includes("@")) {
        localErrors.email = "Please enter a valid email address.";
      }
    } else {
      if (!email.trim()) {
        localErrors.email = "Please enter your assigned Login ID.";
      }
    }
    if (password.length < 6) {
      localErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, user: userProfile } = response.data;

      // Crucial Fix: Hydrate the global context state instantly to prevent AuthGate popups
      await login(token, userProfile);

      // Clean role matrix navigation routing
      if (userProfile.role === "TECHNICIAN") {
        router.replace("/(technician)");
      } else {
        router.replace("/(client)");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Log in to manage your bookings and track technicians on Karigar
          </Text>
        </View>

        {/* Cohesive Role Selection Block for Accessible Layout Consistency */}
        <View style={styles.roleSelectionGroup}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.roleBlockCard,
              role === "CLIENT" && styles.roleBlockActive,
            ]}
            onPress={() => setRole("CLIENT")}
          >
            <Icon
              name="briefcase-outline"
              size={26}
              color={role === "CLIENT" ? theme.colors.primary : "#777"}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.roleBlockTitle,
                role === "CLIENT" && styles.roleTextActive,
              ]}
            >
              Client Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.roleBlockCard,
              role === "TECHNICIAN" && styles.roleBlockActive,
            ]}
            onPress={() => setRole("TECHNICIAN")}
          >
            <Icon
              name="hammer-outline"
              size={26}
              color={role === "TECHNICIAN" ? theme.colors.primary : "#777"}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.roleBlockTitle,
                role === "TECHNICIAN" && styles.roleTextActive,
              ]}
            >
              Technician Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Input
            label={
              role === "TECHNICIAN" ? "Technician Login ID" : "Email Address"
            }
            placeholder={
              role === "TECHNICIAN"
                ? "e.g. KG-MAR-2026-007"
                : "e.g. client@example.com"
            }
            value={email}
            onChangeText={setEmail}
            keyboardType={role === "TECHNICIAN" ? "default" : "email-address"} // Normal text keyboard for custom keys
            autoCapitalize="characters" // Automatically helps capitalize their custom roll code string
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Enter your account password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button
            label="Log In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <Text style={styles.switchAuthText}>
            Don't have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => router.push("/(auth)/register")}
            >
              Register here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: {
    padding: theme.spacing.xl,
    justifyContent: "center",
    flexGrow: 1,
  },
  headerSection: { marginBottom: theme.spacing.lg },
  title: {
    fontSize: 28,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  roleSelectionGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: theme.spacing.xl,
  },
  roleBlockCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleBlockActive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  roleBlockTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  roleTextActive: { color: theme.colors.primary },
  formSection: { width: "100%" },
  loginButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderRadius: 12,
  },
  switchAuthText: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
