import React, { useState } from "react";
import { View, Text, StyleSheet,  ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { theme } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient"
import { SafeAreaView } from "react-native-safe-area-context";
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const localErrors: typeof errors = {};
    if (!email.includes("@")) localErrors.email = "Please enter a valid email address.";
    if (password.length < 6) localErrors.password = "Password must be at least 6 characters.";
    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token } = response.data;

      // Persist token in production-grade secure store
      await SecureStore.setItemAsync("authToken", token);

      // Redirect into the stateful client tabs shell application
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to manage your bookings and track technicians</Text>
        </View>

        <View style={styles.formSection}>
          <Input
            label="Email Address"
            placeholder="e.g. client@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
            <Text style={styles.link} onPress={() => router.push("/(auth)/register")}>
              Register here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background},
  scrollContainer: { padding: theme.spacing.xl, justifyContent: "center", flexGrow: 1 },
  headerSection: { marginBottom: theme.spacing.xxl },
  title: { fontSize: 28, fontWeight: theme.typography.fontWeights.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.fontSizes.md, color: theme.colors.textSecondary, lineHeight: theme.typography.lineHeights.normal },
  formSection: { width: "100%" },
  loginButton: { marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  switchAuthText: { textAlign: "center", color: theme.colors.textSecondary, fontSize: theme.typography.fontSizes.sm },
  link: { color: theme.colors.primary, fontWeight: theme.typography.fontWeights.semibold },
});