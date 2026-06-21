// src/app/index.tsx
import { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../features/auth/store";
import { theme } from "../theme";

export default function AppEntryGate() {
  const router = useRouter();
  const { token, isLoading, isGuest } = useAuth();

  useEffect(() => {
    // Wait until the authentication store finishes reading from SecureStore/localStorage
    if (isLoading) return;

    if (token) {
      // 1. User is authenticated -> Send them straight to the main app dashboard tabs
      router.replace("/(client)");
    } else if (isGuest) {
      // 2. User is verified as an anonymous guest -> Send them to the marketplace home layout
      router.replace("/(client)");
    } else {
      // 3. Brand new user with no credentials -> Send them to the onboarding sequence
      router.replace("/onboarding/welcome");
    }
  }, [token, isLoading, isGuest]);

  // Premium neutral loading splash framework while state synchronizes
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