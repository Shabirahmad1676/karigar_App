import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../../theme";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { useAuthGuard } from "../../../hooks/useAuthGuard";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";

export default function DetailsStep() {
  const router = useRouter();
  const { executeProtectedAction } = useAuthGuard();
  const { formData, updateFields } = useJobFormStore();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    executeProtectedAction(() => {
      console.log("Client permissions verified successfully");
    });
  }, []);

  const handleNext = () => {
    // 🌟 Check that all required inputs—including the background serviceId—are set
    if (!formData.title || !formData.description || !formData.budget || !formData.serviceId) {
      setErrorMsg("Please populate all parameters prior to advancing step workflows.");
      return;
    }
    if (parseInt(formData.budget) <= 0) {
      setErrorMsg("Budget target must be a positive number.");
      return;
    }
    setErrorMsg("");
    router.push("/(client)/post-job/location");
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Step 1 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "25%" }]} />
          </View>
        </View>
        
        <Text style={styles.title}>Project Scope Context</Text>

        <View style={styles.fieldGroup}>
          <Input
            label="Job Title"
            placeholder="e.g. Broken master bathroom valve leak"
            value={formData.title}
            onChangeText={(text) => updateFields({ title: text })}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Input
            label="Detailed Problem Statement Description"
            placeholder="Describe exactly what needs fixing..."
            value={formData.description}
            onChangeText={(text) => updateFields({ description: text })}
            multiline
            numberOfLines={4}
            style={styles.multilineInput}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Input
            label="Estimated Working Budget Target (Rs.)"
            placeholder="e.g. 2500"
            value={formData.budget}
            onChangeText={(text) => updateFields({ budget: text.replace(/[^0-9]/g, "") })} // Pure digit filter
            keyboardType="numeric"
          />
        </View>

        {/* 🌟 CRO FIX: The manual 'services' request grid and select buttons have been stripped completely. 
            The system securely carries over the pre-selected sub-service in the background. */}

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={16} color={theme.colors.danger} />
            <Text style={styles.error}>{errorMsg}</Text>
          </View>
        ) : null}

        <Button label="Continue to Location Coordinates" onPress={handleNext} style={styles.navButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  container: { 
    padding: theme.spacing.xl, 
    paddingBottom: theme.spacing.xxl,
  },
  progressHeader: { 
    marginBottom: theme.spacing.md,
  },
  stepIndicator: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeights.heading,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  fieldGroup: { 
    marginBottom: theme.spacing.xl,
  },
  multilineInput: {
    height: 120, 
    paddingTop: theme.spacing.md,
    lineHeight: theme.typography.lineHeights.normal,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(226, 75, 74, 0.15)",
  },
  error: {
    flex: 1,
    color: theme.colors.danger,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    lineHeight: theme.typography.lineHeights.tight,
  },
  navButton: { 
    marginTop: theme.spacing.sm,
  },
});