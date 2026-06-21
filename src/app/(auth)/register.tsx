import React, { useState } from "react";
import { View, Text, StyleSheet,  ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { theme } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string }>({});

  const validate = () => {
    const localErrors: typeof errors = {};
    if (!name.trim()) localErrors.name = "Full name is required.";
    if (!email.includes("@")) localErrors.email = "Please enter a valid email address.";
    if (phone.length < 10) localErrors.phone = "Please enter a valid phone number.";
    if (password.length < 6) localErrors.password = "Password must be at least 6 characters.";
    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Maps fields seamlessly to match backend DTO parameters
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        phone,
        password,
        role: "CLIENT",
      });

      const { token } = response.data;
      await SecureStore.setItemAsync("authToken", token);

      router.replace("/(client)/home");
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. This email may already be registered.";
      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to request verified on-demand home maintenance operators</Text>
        </View>

        <View style={styles.formSection}>
          <Input
            label="Full Name"
            placeholder="e.g. Ahmed Ali"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email Address"
            placeholder="e.g. ahmed@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 03001234567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Password"
            placeholder="Choose a strong password (min 6 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          <Button
            label="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <Text style={styles.switchAuthText}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
              Log in here
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, marginTop:58 },
  scrollContainer: { padding: theme.spacing.xl, paddingVertical: theme.spacing.xxl, flexGrow: 1 },
  headerSection: { marginBottom: theme.spacing.xl },
  title: { fontSize: 28, fontWeight: theme.typography.fontWeights.bold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.fontSizes.md, color: theme.colors.textSecondary, lineHeight: theme.typography.lineHeights.normal },
  formSection: { width: "100%" },
  registerButton: { marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  switchAuthText: { textAlign: "center", color: theme.colors.textSecondary, fontSize: theme.typography.fontSizes.sm },
  link: { color: theme.colors.primary, fontWeight: theme.typography.fontWeights.semibold },
});