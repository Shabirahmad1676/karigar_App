import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { useJobFormStore } from "../../../features/services/postJobStore";

import {SafeAreaView} from "react-native-safe-area-context";
export default function PhotosStep() {
  const router = useRouter();
  const { formData, updateFields } = useJobFormStore();

  const mockCameraLibraryPicker = () => {
    // Simulates standard document gallery platform callbacks
    updateFields({ localImageUri: "file:///var/mobile/containers/Data/Application/mock-photo.jpg" });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 3 of 4</Text>
        <Text style={styles.title}>Attach Visual Context Evidence</Text>

        <TouchableOpacity style={styles.uploadPlaceholderBox} onPress={mockCameraLibraryPicker} activeOpacity={0.8}>
          {formData.localImageUri ? (
            <Text style={styles.photoBoxText}>✓ Image Attached Successfully {"\n"}<Text style={{ fontSize: 11 }}>({formData.localImageUri.split("/").pop()})</Text></Text>
          ) : (
            <Text style={styles.uploadPlaceholderText}>📸 Tap to Open Camera roll / Device Gallery</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <Button label="Back" onPress={() => router.back()} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue to Final Audit" onPress={() => router.push("/(client)/post-job/review")} style={{ flex: 2 }} />
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
  uploadPlaceholderBox: { width: "100%", height: 180, borderStyle: "dashed", borderWidth: 2, borderColor: theme.colors.primary, borderRadius: 12, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.surface, padding: 20 },
  uploadPlaceholderText: { color: theme.colors.primary, fontWeight: "600", fontSize: 15 },
  photoBoxText: { color: theme.colors.success, fontWeight: "bold", textAlign: "center", fontSize: 15 },
  buttonRow: { flexDirection: "row", gap: 15, marginTop: "auto" },
});