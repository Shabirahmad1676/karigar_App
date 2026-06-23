// src/app/index.tsx
import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../features/auth/store";
import { theme } from "../theme";

export default function AppEntryGate() {
  const router = useRouter();
  const { token, isLoading, isGuest, user } = useAuth();

  useEffect(() => {
    // Wait until secure store loading completes
    if (isLoading) return;

    if (token) {
      // User is verified! Check role matrix to bypass onboarding completely
      if (user?.role === "TECHNICIAN") {
        router.replace("/(technician)");
      } else {
        router.replace("/(client)");
      }
    } else if (isGuest) {
      // Anonymous browser bypass
      router.replace("/(client)");
    } else {
      // First time entry route checkpoint
      router.replace("/onboarding/welcome");
    }
  }, [token, isLoading, isGuest, user]);

  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});