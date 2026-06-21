import React from "react";
import { View, Text, StyleSheet, StatusBar, Image } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    // Handled in auth feature branch later
    console.log("Initiating Google Auth Pipeline...");
  };

  const handleEmailSignIn = () => {
    // Routes directly to login form
    router.push("/(auth)/login");
  };

  const handleGuestSkip = () => {
    // Drops straight into the tabs layout framework as anonymous guest
    router.replace("/(client)");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.contentContainer}>
        {/* Top Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            {/* Styled structural container for your marketplace logo brand icon */}
            <Text style={styles.logoText}>K</Text>
          </View>
          
          <Text style={styles.headline}>Get home services{"\n"}fixed, fast.</Text>
          <Text style={styles.subheadline}>
            Connect instantly with verified local technicians across Pakistan for plumbing, electrical work, carpentry, and more.
          </Text>
        </View>

        {/* Authentication Card Block */}
        <Card style={styles.authCard}>
          <Text style={styles.cardTitle}>Get Started</Text>
          
          <Button
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="secondary"
            style={styles.actionButton}
          />

          <Button
            label="Continue with Email"
            onPress={handleEmailSignIn}
            variant="primary"
            style={styles.actionButton}
          />

          {/* Skip Bypass Trigger */}
          <Text onPress={handleGuestSkip} style={styles.skipLink}>
            Skip for now
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: "space-between",
    paddingVertical: theme.spacing.xl,
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: theme.spacing.xxl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
    // Soft drop shadow matching professional app architecture
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSizes.h1,
    fontWeight: theme.typography.fontWeights.bold,
  },
  headline: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    lineHeight: 40,
    marginBottom: theme.spacing.md,
  },
  subheadline: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.regular,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  authCard: {
    width: "100%",
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    alignSelf: "flex-start",
  },
  actionButton: {
    width: "100%",
    marginBottom: theme.spacing.md,
  },
  skipLink: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
    textDecorationLine: "underline",
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs, // Expands hit target area box for safety
  },
});