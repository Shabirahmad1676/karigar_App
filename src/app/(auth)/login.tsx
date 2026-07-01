import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Pressable,
  Animated,
  TextInput,
  Easing,
  LayoutChangeEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { apiClient } from "../../lib/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/store";
import Icon from "@react-native-vector-icons/ionicons";

// NOTE ON SCOPE
// This file keeps the exact same functional contract as the original
// LoginScreen: same validate() rules, same apiClient.post("/auth/login", ...)
// call, same login()/router.replace() flow, same error surface via
// Alert.alert for request failures. The <Input> / <Button> design-system
// components are inlined here as locally-styled equivalents so the
// micro-interactions (focus ring, error shake, press scale, pill slide,
// field crossfade) can be wired directly to Animated.Values. If your
// <Input>/<Button> components already forward onFocus/onBlur/onPressIn/
// onPressOut, you can swap these local pieces back out for them 1:1.

type Role = "CLIENT" | "TECHNICIAN";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>("CLIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // ---- animation refs -------------------------------------------------
  const pillAnim = useRef(new Animated.Value(0)).current; // 0 = CLIENT, 1 = TECHNICIAN
  const fieldFade = useRef(new Animated.Value(1)).current; // crossfade for label/placeholder
  const screenFade = useRef(new Animated.Value(1)).current; // exit transition on success
  const emailShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const runShake = (val: Animated.Value) => {
    val.setValue(0);
    Animated.sequence([
      Animated.timing(val, { toValue: 1, duration: 45, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(val, { toValue: -1, duration: 45, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(val, { toValue: 1, duration: 45, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(val, { toValue: 0, duration: 45, easing: Easing.linear, useNativeDriver: false }),
    ]).start();
  };

  const focusIn = (val: Animated.Value) =>
    Animated.timing(val, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  const focusOut = (val: Animated.Value) =>
    Animated.timing(val, { toValue: 0, duration: 150, useNativeDriver: false }).start();

  const switchRole = useCallback(
    (next: Role) => {
      if (next === role) return;

      // pill slide
      Animated.spring(pillAnim, {
        toValue: next === "CLIENT" ? 0 : 1,
        useNativeDriver: false,
        tension: 60,
        friction: 9,
      }).start();

      // field label / placeholder crossfade (fade out -> swap -> fade in)
      Animated.timing(fieldFade, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
        setRole(next);
        setErrors({});
        Animated.timing(fieldFade, { toValue: 1, duration: 120, useNativeDriver: true }).start();
      });
    },
    [role, pillAnim, fieldFade],
  );

  // ---- validation -------------------------------------------------------
  // Same rules as the original: email format for CLIENT, non-empty ID for
  // TECHNICIAN, 6+ char password. Now callable per-field (onBlur) as well
  // as on submit.
  const validateEmail = (value: string, currentRole: Role) => {
    if (currentRole === "CLIENT") {
      return value.includes("@") ? undefined : "Please enter a valid email address.";
    }
    return value.trim() ? undefined : "Please enter your assigned Login ID.";
  };

  const validatePassword = (value: string) =>
    value.length < 6 ? "Password must be at least 6 characters." : undefined;

  const validate = () => {
    const localErrors: typeof errors = {
      email: validateEmail(email, role),
      password: validatePassword(password),
    };
    const cleaned = Object.fromEntries(
      Object.entries(localErrors).filter(([, v]) => v !== undefined),
    );
    setErrors(cleaned);
    if (cleaned.email) runShake(emailShake);
    if (cleaned.password) runShake(passwordShake);
    return Object.keys(cleaned).length === 0;
  };

  const handleEmailBlur = () => {
    const err = validateEmail(email, role);
    setErrors((prev) => ({ ...prev, email: err }));
    if (err) runShake(emailShake);
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: err }));
    if (err) runShake(passwordShake);
  };

  // ---- submit -------------------------------------------------------
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, user: userProfile } = response.data;

      await login(token, userProfile);

      // soft exit fade before navigating, instead of a hard cut
      Animated.timing(screenFade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        if (userProfile.role === "TECHNICIAN") {
          router.replace("/(technician)");
        } else {
          router.replace("/(client)");
        }
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", message);
      runShake(passwordShake);
    } finally {
      setLoading(false);
    }
  };

  const pillTranslateX = pillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth / 2],
  });

  const emailBorderColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [errors.email ? theme.colors.danger ?? "#D64545" : theme.colors.border, theme.colors.primary],
  });
  const passwordBorderColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [errors.password ? theme.colors.danger ?? "#D64545" : theme.colors.border, theme.colors.primary],
  });

  const emailShakeX = emailShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });
  const passwordShakeX = passwordShake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: screenFade }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Icon name="hammer" size={20} color="#fff" />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to manage your bookings on Karigar</Text>
          </View>

          {/* Sliding pill role toggle */}
          <View style={styles.pillTrack} onLayout={onTrackLayout}>
            {trackWidth > 0 && (
              <Animated.View
                style={[
                  styles.pillIndicator,
                  { width: trackWidth / 2 - 4, transform: [{ translateX: pillTranslateX }] },
                ]}
              />
            )}
            <Pressable style={styles.pillHalf} onPress={() => switchRole("CLIENT")}>
              <Icon
                name="briefcase-outline"
                size={16}
                color={role === "CLIENT" ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text style={[styles.pillLabel, role === "CLIENT" && styles.pillLabelActive]}>Client</Text>
            </Pressable>
            <Pressable style={styles.pillHalf} onPress={() => switchRole("TECHNICIAN")}>
              <Icon
                name="hammer-outline"
                size={16}
                color={role === "TECHNICIAN" ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text style={[styles.pillLabel, role === "TECHNICIAN" && styles.pillLabelActive]}>Technician</Text>
            </Pressable>
          </View>

          <Animated.View style={[styles.formSection, { opacity: fieldFade }]}>
            {/* Email / Login ID field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {role === "TECHNICIAN" ? "Technician login ID" : "Email address"}
              </Text>
              <Animated.View
                style={[styles.inputRow, { borderColor: emailBorderColor, transform: [{ translateX: emailShakeX }] }]}
              >
                <Icon
                  name={role === "TECHNICIAN" ? "key-outline" : "mail-outline"}
                  size={18}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={role === "TECHNICIAN" ? "e.g. KG-MAR-2026-007" : "e.g. client@example.com"}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => focusIn(emailFocusAnim)}
                  onBlur={() => {
                    focusOut(emailFocusAnim);
                    handleEmailBlur();
                  }}
                  keyboardType={role === "TECHNICIAN" ? "default" : "email-address"}
                  autoCapitalize={role === "TECHNICIAN" ? "characters" : "none"}
                />
              </Animated.View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password field */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                <Text style={styles.forgotLink}>Forgot?</Text>
              </View>
              <Animated.View
                style={[
                  styles.inputRow,
                  { borderColor: passwordBorderColor, transform: [{ translateX: passwordShakeX }] },
                ]}
              >
                <Icon name="lock-closed-outline" size={18} color={theme.colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your account password"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => focusIn(passwordFocusAnim)}
                  onBlur={() => {
                    focusOut(passwordFocusAnim);
                    handlePasswordBlur();
                  }}
                  secureTextEntry={secureText}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setSecureText((prev) => !prev)}
                  activeOpacity={0.7}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={secureText ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </Animated.View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <Pressable
              onPress={handleLogin}
              onPressIn={() => Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()}
              disabled={loading}
            >
              <Animated.View style={[styles.loginButton, { transform: [{ scale: buttonScale }] }]}>
                <Text style={styles.loginButtonText}>{loading ? "Logging in..." : "Log in"}</Text>
                {!loading && <Icon name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />}
              </Animated.View>
            </Pressable>

            <Text style={styles.switchAuthText}>
              Don't have an account?{" "}
              <Text style={styles.link} onPress={() => router.push("/(auth)/register")}>
                Register here
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </Animated.View>
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
  headerSection: { alignItems: "center", marginBottom: theme.spacing.lg },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  pillTrack: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: theme.spacing.xl,
    position: "relative",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: "#fff",
    borderRadius: 11,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pillHalf: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  pillLabel: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  pillLabelActive: { color: theme.colors.primary },
  formSection: { width: "100%" },
  fieldGroup: { marginBottom: theme.spacing.md },
  fieldLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  fieldLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 6 },
  forgotLink: { fontSize: 12, color: theme.colors.primary, fontWeight: theme.typography.fontWeights.bold },
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
  loginButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  loginButtonText: { color: "#fff", fontSize: 14, fontWeight: theme.typography.fontWeights.bold },
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