import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Animated, Modal } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { theme } from "../../theme";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiClient } from "../../lib/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useAuth } from "../../features/auth/store";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "TECHNICIAN">("CLIENT");
  
  const [skillCategory, setSkillCategory] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Custom interactive layout modal replacement for Problem 4
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const techHeightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(techHeightAnim, {
      toValue: role === "TECHNICIAN" ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [role]);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Missing Information", "Please fill in all standard fields.");
      return;
    }
    if (role === "TECHNICIAN" && (!skillCategory || !city)) {
      Alert.alert("Details Needed", "Please tell us your work type and city.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        name, email, phone, password, role, skillCategory, city
      });

      const { token, user: userProfile } = response.data;
      
      // Update store variables instantly to maintain context alignment
      await login(token, userProfile);
      setRegisteredProfile(userProfile);
      setSuccessModalVisible(true); // Open the custom premium UI confirmation card 
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  };

  const executeEnterAppRedirect = () => {
    setSuccessModalVisible(false);
    if (registeredProfile?.role === "TECHNICIAN") {
      router.replace("/(technician)");
    } else {
      router.replace("/(client)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <Text style={styles.title}>Welcome to <Text style={styles.brandText}>Karigar</Text></Text>
          <Text style={styles.subtitle}>Find trusted workers or get more work.</Text>

          <View style={styles.roleSelectionGroup}>
            <TouchableOpacity 
              activeOpacity={0.9}
              style={[styles.roleBlockCard, role === "CLIENT" && styles.roleBlockActive]} 
              onPress={() => setRole("CLIENT")}
            >
              <Ionicons name="briefcase-outline" size={32} color={role === "CLIENT" ? theme.colors.primary : "#777"} />
              <Text style={[styles.roleBlockTitle, role === "CLIENT" && styles.roleTextActive]}>Hire a Karigar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.9}
              style={[styles.roleBlockCard, role === "TECHNICIAN" && styles.roleBlockActive]} 
              onPress={() => setRole("TECHNICIAN")}
            >
              <Ionicons name="hammer-outline" size={32} color={role === "TECHNICIAN" ? theme.colors.primary : "#777"} />
              <Text style={[styles.roleBlockTitle, role === "TECHNICIAN" && styles.roleTextActive]}>Find Work</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formStack}>
            <Input label="Full Name" placeholder="e.g., Shabir Ahmad" value={name} onChangeText={setName} />
            <Input label="Email Address" placeholder="name@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Input label="Phone Number" placeholder="e.g., 03001234567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Input label="Password" placeholder="Minimum 6 characters" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          </View>

          {role === "TECHNICIAN" && (
            <Animated.View style={[styles.techSection, { opacity: techHeightAnim, transform: [{ translateY: techHeightAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
              <Text style={styles.techHeader}>Tell us about your work</Text>
              <View style={styles.formStack}>
                <Input label="What is your job? (Skill)" placeholder="e.g., Plumber, Electrician" value={skillCategory} onChangeText={setSkillCategory} />
                <Input label="Your City" placeholder="e.g., Mardan, Rustam" value={city} onChangeText={setCity} />
              </View>
            </Animated.View>
          )}

          <Button label="Get Started" onPress={handleRegister} loading={loading} style={styles.submitBtn} />
          <Text style={styles.switchAuthText}>Already have an account? <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>Sign in here</Text></Text>
        </ScrollView>
      </Animated.View>

      {/* Upgraded Professional Success Overlay Sheet replacing crude Alert */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={54} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Profile Setup Complete!</Text>
            <Text style={styles.successDesc}> Welcome to Karigar. Your dynamic account credentials are successfully locked onto the marketplace database chain.</Text>
            <Button label="Enter Application Workspace" onPress={executeEnterAppRedirect} variant="primary" style={styles.modalBtn} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xxl, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, lineHeight: 20 },
  brandText: { fontWeight: "800", color: theme.colors.primary },
  roleSelectionGroup: { flexDirection: "row", gap: 12, marginBottom: theme.spacing.xl },
  roleBlockCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 16, paddingVertical: theme.spacing.lg, alignItems: "center", borderWidth: 1, borderColor: theme.colors.border },
  roleBlockActive: { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 2 },
  roleBlockTitle: { fontSize: theme.typography.fontSizes.sm, fontWeight: "700", color: theme.colors.textSecondary },
  roleTextActive: { color: theme.colors.primary },
  formStack: { gap: theme.spacing.md },
  techSection: { marginTop: theme.spacing.xl, padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  techHeader: { fontSize: theme.typography.fontSizes.md, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.md },
  submitBtn: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl, borderRadius: 12, paddingVertical: theme.spacing.lg },
  switchAuthText: { textAlign: "center", color: theme.colors.textSecondary, fontSize: theme.typography.fontSizes.sm },
  link: { color: theme.colors.primary, fontWeight: "700" },
  // Modal Overlay styling configurations
  modalOverlay: { flex: 1, backgroundColor: "rgba(26,26,26,0.6)", justifyContent: "center", alignItems: "center", padding: theme.spacing.xl },
  successCard: { width: "100%", backgroundColor: theme.colors.surface, borderRadius: 24, padding: theme.spacing.xl, alignItems: "center" },
  iconCircle: { marginBottom: theme.spacing.md },
  successTitle: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  successDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: theme.spacing.xl },
  modalBtn: { width: "100%", borderRadius: 12 }
});