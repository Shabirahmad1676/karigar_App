import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhotosStep() {
  const router = useRouter();
  const { formData, updateFields } = useJobFormStore();

  const handleCameraLibraryPicker = async () => {
    // Request hardware gallery permissions from the mobile operating system
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to your photo gallery is required to upload visual context evidence.");
      return;
    }

    // Launch the native system image picker selection modal interface
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7, // Slightly compresses asset scale footprints to minimize transmission bounds
    });

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      // Pass the real native storage cache asset URI to your wizard provider data layer
      updateFields({ localImageUri: pickerResult.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 3 of 4</Text>
        <Text style={styles.title}>Attach Visual Context Evidence</Text>

        <TouchableOpacity style={styles.uploadPlaceholderBox} onPress={handleCameraLibraryPicker} activeOpacity={0.8}>
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