import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { apiClient } from "../../../lib/apiClient";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";

export default function ReviewStep() {
  const router = useRouter();
  const { formData, clearForm } = useJobFormStore();
  const [submitting, setSubmitting] = useState(false);

  const handleFinalSubmission = async () => {
    if (!formData.title || !formData.description || !formData.budget || !formData.serviceId) {
      Alert.alert("Missing Data", "Your job post details appear to be empty. Please go back and fill out the form steps.");
      return;
    }

    setSubmitting(true);
    try {
      const jobPayload = {
        title: formData.title,
        description: formData.description,
        budget: parseInt(formData.budget), // 👈 📦 Parses dynamic user input text field perfectly
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
            router.replace("/(client)/bookings");
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
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Step 4 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
        </View>
        <Text style={styles.title}>Final Ledger Audit Review</Text>

        <Card style={styles.reviewCard}>
          <View style={styles.sectionHeaderRow}>
            <Icon name="document-text-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.sectionHeader}>Core Scope</Text>
          </View>
          <Text style={styles.reviewText}>
            <Text style={styles.boldLabel}>Title: </Text>
            {formData.title || "Wiped/Missing"}
          </Text>
          <Text style={styles.reviewText}>
            <Text style={styles.boldLabel}>Context: </Text>
            {formData.description || "Wiped/Missing"}
          </Text>
          <Text style={styles.reviewText}>
            <Text style={styles.boldLabel}>Target Quote Budget: </Text>
            Rs. {parseInt(formData.budget || "0").toLocaleString("en-PK")}
          </Text>

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Icon name="location-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.sectionHeader}>Deployment Coordinates</Text>
          </View>
          <Text style={styles.reviewText} numberOfLines={2}>
            <Text style={styles.boldLabel}>Address: </Text>
            {formData.address || "None specified"}
          </Text>

          <View style={styles.divider} />

          <View style={styles.sectionHeaderRow}>
            <Icon name="image-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.sectionHeader}>Media Evidence Status</Text>
          </View>
          <View style={styles.mediaStatusRow}>
            <Icon
              name={formData.localImageUri ? "checkmark-circle" : "alert-circle-outline"}
              size={16}
              color={formData.localImageUri ? theme.colors.success : "#94A3B8"}
            />
            <Text
              style={[
                styles.reviewText,
                styles.mediaStatusText,
                { color: formData.localImageUri ? theme.colors.success : "#64748B" },
              ]}
            >
              {formData.localImageUri ? "Visual photographic attachment linked" : "No visual profile media attached"}
            </Text>
          </View>
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
  safeContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { padding: 24, flex: 1 },

  progressHeader: { marginBottom: 8 },
  stepIndicator: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 24,
    marginTop: 12,
  },

  reviewCard: {
    width: "100%",
    padding: 20,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  reviewText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#334155",
    marginBottom: 8,
    lineHeight: 20,
  },
  boldLabel: { fontWeight: "600", color: "#0F172A" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },

  mediaStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mediaStatusText: { marginBottom: 0, flex: 1 },

  buttonRow: { flexDirection: "row", gap: 12, marginTop: "auto" },
});