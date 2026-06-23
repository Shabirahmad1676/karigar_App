import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { apiClient } from "../../../lib/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewStep() {
  const router = useRouter();
  const { formData, clearForm } = useJobFormStore();
  const [submitting, setSubmitting] = useState(false);

  const handleFinalSubmission = async () => {
    // Safety check: Prevent network calls if data fields are missing
    if (!formData.title || !formData.description || !formData.serviceId) {
      Alert.alert("Missing Data", "Your job post details appear to be empty. Please go back and fill out the form steps.");
      return;
    }

    setSubmitting(true);
    try {
      const jobPayload = {
        title: formData.title,
        description: formData.description,
        budget: 1500, 
        serviceId: Number(formData.serviceId),
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
      };

      const jobResponse = await apiClient.post("/jobs", jobPayload);
      const createdJobId = jobResponse.data.id;

      if (formData.localImageUri && createdJobId) {
        const imageForm = new FormData();
        imageForm.append("image", {
          uri: formData.localImageUri,
          name: `job-${createdJobId}-upload.jpg`,
          type: "image/jpeg",
        } as any);

        await apiClient.post(`/jobs/${createdJobId}/image`, imageForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      Alert.alert("Success", "Your maintenance request has been created!", [
        {
          text: "View My Ledger",
          onPress: () => {
            clearForm();
            router.replace("/(client)");
          },
        },
      ]);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Submission Error", err.response?.data?.error || "Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 4 of 4</Text>
        <Text style={styles.title}>Final Ledger Audit Review</Text>

        <Card style={styles.reviewCard}>
          <Text style={styles.sectionHeader}>Core Scope</Text>
          <Text style={styles.reviewText}>
            <Text style={styles.boldLabel}>Title: </Text>
            {formData.title || "Wiped/Missing"}
          </Text>
          <Text style={styles.reviewText}>
            <Text style={styles.boldLabel}>Context: </Text>
            {formData.description || "Wiped/Missing"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Deployment Coordinates</Text>
          <Text style={styles.reviewText} numberOfLines={2}>
            <Text style={styles.boldLabel}>Address: </Text>
            {formData.address || "None specified"}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Media Evidence Status</Text>
          <Text style={[styles.reviewText, { color: formData.localImageUri ? theme.colors.success : theme.colors.textSecondary }]}>
            {formData.localImageUri ? "✓ Visual photographic attachment linked" : "⚠ No visual profile media attached"}
          </Text>
        </Card>

        <View style={styles.buttonRow}>
          <Button label="Back" onPress={() => router.back()} variant="ghost" style={{ flex: 1 }} disabled={submitting} />
          <Button label="Commit & Launch Request" onPress={handleFinalSubmission} loading={submitting} style={{ flex: 2 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.xl, flex: 1 },
  stepIndicator: { fontSize: 12, fontWeight: "bold", color: theme.colors.primary, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: theme.colors.textPrimary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  reviewCard: { width: "100%", padding: theme.spacing.lg, marginBottom: theme.spacing.xl },
  sectionHeader: { fontSize: 12, fontWeight: "bold", color: theme.colors.primary, textTransform: "uppercase", marginBottom: 6 },
  reviewText: { fontSize: 14, color: theme.colors.textPrimary, marginBottom: theme.spacing.sm, lineHeight: 20 },
  boldLabel: { fontWeight: "700" },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.sm },
  buttonRow: { flexDirection: "row", gap: 15, marginTop: "auto" },
});