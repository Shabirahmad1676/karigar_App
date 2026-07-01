import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Pressable,
  Animated,
  Modal,
  Linking,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { apiClient } from "../../lib/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useAuth } from "../../features/auth/store";

// NOTE ON SCOPE
// Functional contract is unchanged from the original RegisterScreen:
// same required-field check (name/email/phone/password) before calling
// apiClient.post("/auth/register", ...), same login()/success-modal/
// redirect flow, same WhatsApp deep link for technician onboarding, same
// Google button placeholder. Role toggle + technician fields stay
// commented out exactly as they were in your source — this only touches
// visual presentation and adds focus/press/shake micro-interactions.
// <Input>/<Button> are inlined locally so those animations can attach
// directly to onFocus/onBlur/onPressIn/onPressOut.

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState<"CLIENT" | "TECHNICIAN">("CLIENT");

  const [skillCategory] = useState("");
  const [city] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const nameFocus = useRef(new Animated.Value(0)).current;
  const emailFocus = useRef(new Animated.Value(0)).current;
  const phoneFocus = useRef(new Animated.Value(0)).current;
  const passwordFocus = useRef(new Animated.Value(0)).current;

  const nameShake = useRef(new Animated.Value(0)).current;
  const emailShake = useRef(new Animated.Value(0)).current;
  const phoneShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;

  const submitScale = useRef(new Animated.Value(1)).current;
  const whatsappScale = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (successModalVisible) {
      modalScale.setValue(0.92);
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 60 }).start();
    }
  }, [successModalVisible]);

  const runShake = (val: Animated.Value) => {
    val.setValue(0);
    Animated.sequence([
      Animated.timing(val, { toValue: 1, duration: 45, useNativeDriver: false }),
      Animated.timing(val, { toValue: -1, duration: 45, useNativeDriver: false }),
      Animated.timing(val, { toValue: 1, duration: 45, useNativeDriver: false }),
      Animated.timing(val, { toValue: 0, duration: 45, useNativeDriver: false }),
    ]).start();
  };

  const focusIn = (val: Animated.Value) =>
    Animated.timing(val, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  const focusOut = (val: Animated.Value) =>
    Animated.timing(val, { toValue: 0, duration: 150, useNativeDriver: false }).start();

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      setTouched({ name: true, email: true, phone: true, password: true });
      if (!name) runShake(nameShake);
      if (!email) runShake(emailShake);
      if (!phone) runShake(phoneShake);
      if (!password) runShake(passwordShake);
      Alert.alert("Missing information", "Please fill in all standard fields.");
      return;
    }
    if (role === "TECHNICIAN" && (!skillCategory || !city)) {
      Alert.alert("Details needed", "Please tell us your work type and city.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        phone,
        password,
        role,
        skillCategory,
        city,
      });

      const { token, user: userProfile } = response.data;

      await login(token, userProfile);
      setRegisteredProfile(userProfile);
      setSuccessModalVisible(true);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Initiating dynamic Client Google Auth OAuth pipeline...");
  };

  const executeEnterAppRedirect = () => {
    setSuccessModalVisible(false);
    if (registeredProfile?.role === "TECHNICIAN") {
      router.replace("/(technician)");
    } else {
      router.replace("/(client)");
    }
  };

  const handleWhatsAppOnboarding = () => {
    const adminPhoneNumber = "923337923556";
    const message =
      "Salam Shabir! I want to join Karigar as a technician. Please create my account profile and issue my login ID credentials.";
    const url = `whatsapp://send?phone=${adminPhoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`);
        }
      })
      .catch((err) => console.error("An error occurred opening WhatsApp", err));
  };

  const borderColor = (focusAnim: Animated.Value, hasError: boolean) =>
    focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [hasError ? theme.colors.danger ?? "#D64545" : theme.colors.border, theme.colors.primary],
    });
  const shakeX = (val: Animated.Value) =>
    val.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });

  const nameError = touched.name && !name ? "Name is required." : undefined;
  const emailError = touched.email && !email ? "Email is required." : undefined;
  const phoneError = touched.phone && !phone ? "Phone number is required." : undefined;
  const passwordError = touched.password && !password ? "Password is required." : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="hammer" size={20} color="#fff" />
            </View>
            <Text style={styles.title}>
              Welcome to <Text style={styles.brandText}>Karigar</Text>
            </Text>
            <Text style={styles.subtitle}>Find trusted workers or get more work.</Text>
          </View>

          <View style={styles.formStack}>
            <Field
              label="Full name"
              placeholder="e.g., Shabir Ahmad"
              value={name}
              onChangeText={setName}
              onFocus={() => focusIn(nameFocus)}
              onBlur={() => {
                focusOut(nameFocus);
                markTouched("name");
                if (!name) runShake(nameShake);
              }}
              iconName="person-outline"
              error={nameError}
              borderColorAnim={borderColor(nameFocus, !!nameError)}
              shakeXAnim={shakeX(nameShake)}
            />
            <Field
              label="Email address"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              onFocus={() => focusIn(emailFocus)}
              onBlur={() => {
                focusOut(emailFocus);
                markTouched("email");
                if (!email) runShake(emailShake);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              iconName="mail-outline"
              error={emailError}
              borderColorAnim={borderColor(emailFocus, !!emailError)}
              shakeXAnim={shakeX(emailShake)}
            />
            <Field
              label="Phone number"
              placeholder="e.g., 03001234567"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => focusIn(phoneFocus)}
              onBlur={() => {
                focusOut(phoneFocus);
                markTouched("phone");
                if (!phone) runShake(phoneShake);
              }}
              keyboardType="phone-pad"
              iconName="call-outline"
              error={phoneError}
              borderColorAnim={borderColor(phoneFocus, !!phoneError)}
              shakeXAnim={shakeX(phoneShake)}
            />
            <Field
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              onFocus={() => focusIn(passwordFocus)}
              onBlur={() => {
                focusOut(passwordFocus);
                markTouched("password");
                if (!password) runShake(passwordShake);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              iconName="lock-closed-outline"
              error={passwordError}
              borderColorAnim={borderColor(passwordFocus, !!passwordError)}
              shakeXAnim={shakeX(passwordShake)}
              rightAccessory={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  activeOpacity={0.7}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          <Pressable
            onPress={handleRegister}
            onPressIn={() => Animated.spring(submitScale, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(submitScale, { toValue: 1, useNativeDriver: true }).start()}
            disabled={loading}
          >
            <Animated.View style={[styles.submitBtn, { transform: [{ scale: submitScale }] }]}>
              <Text style={styles.submitBtnText}>{loading ? "Creating account..." : "Create account"}</Text>
            </Animated.View>
          </Pressable>

          {role === "CLIENT" && (
            <View style={styles.socialDividerSection}>
              <View style={styles.horizontalLineRow}>
                <View style={styles.lineDivider} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.lineDivider} />
              </View>

              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp} activeOpacity={0.85}>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.switchAuthText}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
              Sign in here
            </Text>
          </Text>

          <Pressable
            onPress={handleWhatsAppOnboarding}
            onPressIn={() => Animated.spring(whatsappScale, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(whatsappScale, { toValue: 1, useNativeDriver: true }).start()}
          >
            <Animated.View style={[styles.whatsappBtn, { transform: [{ scale: whatsappScale }] }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.whatsappBtnText}>Join our fleet network as a professional</Text>
            </Animated.View>
          </Pressable>
        </ScrollView>
      </Animated.View>

      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: modalScale }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={54} color={theme.colors.success} />
            </View>
            <Text style={styles.successTitle}>Profile setup complete</Text>
            <Text style={styles.successDesc}>
              Welcome to Karigar. Your account is ready to go.
            </Text>
            <Pressable onPress={executeEnterAppRedirect}>
              <View style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Enter application</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---- shared field renderer -------------------------------------------
function Field(props: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  iconName: string;
  error?: string;
  borderColorAnim: Animated.AnimatedInterpolation<string | number>;
  shakeXAnim: Animated.AnimatedInterpolation<string | number>;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad";
  rightAccessory?: React.ReactNode;
}) {
  const { label, placeholder, value, onChangeText, onFocus, onBlur, iconName, error, borderColorAnim, shakeXAnim, rightAccessory, ...rest } = props;
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Animated.View style={[styles.inputRow, { borderColor: borderColorAnim, transform: [{ translateX: shakeXAnim }] }]}>
        <Ionicons name={iconName as any} size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
        {rightAccessory}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    flexGrow: 1,
  },
  headerSection: { alignItems: "center", marginBottom: theme.spacing.xl },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  title: { fontSize: 22, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: theme.typography.fontSizes.sm, color: theme.colors.textSecondary, textAlign: "center" },
  brandText: { fontWeight: "800", color: theme.colors.primary },
  formStack: { gap: theme.spacing.md },
  fieldGroup: { marginBottom: 2 },
  fieldLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  eyeButton: { paddingLeft: 8, paddingRight: 2 },
  input: { flex: 1, fontSize: 14, color: theme.colors.textPrimary },
  errorText: { fontSize: 12, color: theme.colors.danger ?? "#D64545", marginTop: 6 },
  submitBtn: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderRadius: 12,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  socialDividerSection: { width: "100%", marginBottom: theme.spacing.xl },
  horizontalLineRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: theme.spacing.md },
  lineDivider: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { marginHorizontal: theme.spacing.md, fontSize: 12, color: theme.colors.textSecondary, fontWeight: "600" },
  googleButton: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButtonText: { fontSize: 14, fontWeight: "600", color: theme.colors.textPrimary },
  switchAuthText: { textAlign: "center", color: theme.colors.textSecondary, fontSize: theme.typography.fontSizes.sm, marginBottom: theme.spacing.lg },
  link: { color: theme.colors.primary, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(26,26,26,0.6)", justifyContent: "center", alignItems: "center", padding: theme.spacing.xl },
  successCard: { width: "100%", backgroundColor: theme.colors.surface, borderRadius: 24, padding: theme.spacing.xl, alignItems: "center" },
  iconCircle: { marginBottom: theme.spacing.md },
  successTitle: { fontSize: 20, fontWeight: "700", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  successDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: theme.spacing.xl },
  modalBtn: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  whatsappBtn: {
    backgroundColor: "#25D366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  whatsappBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});