import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";

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
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Step 3 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "75%" }]} />
          </View>
        </View>
        <Text style={styles.title}>Attach Visual Context Evidence</Text>
        <Text style={styles.subtitle}>Optional, but a clear photo helps specialists quote accurately.</Text>

        <TouchableOpacity
          style={[styles.uploadPlaceholderBox, formData.localImageUri ? styles.uploadPlaceholderBoxFilled : null]}
          onPress={handleCameraLibraryPicker}
          activeOpacity={0.7}
        >
          {formData.localImageUri ? (
            <>
              <Image source={{ uri: formData.localImageUri }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}>
                <View style={styles.successBadge}>
                  <Icon name="checkmark-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.successBadgeText}>Attached</Text>
                </View>
                <Text style={styles.previewFileName} numberOfLines={1}>
                  {formData.localImageUri.split("/").pop()}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.uploadIconCircle}>
                <Icon name="camera-outline" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.uploadPlaceholderText}>Tap to open camera roll / device gallery</Text>
            </>
          )}
        </TouchableOpacity>

        {formData.localImageUri ? (
          <TouchableOpacity onPress={handleCameraLibraryPicker} activeOpacity={0.7} style={styles.replaceRow}>
            <Icon name="sync-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.replaceText}>Choose a different photo</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.buttonRow}>
          <Button label="Back" onPress={() => router.back()} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue to Final Audit" onPress={() => router.push("/(client)/post-job/review")} style={{ flex: 2 }} />
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
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 24,
  },

  uploadPlaceholderBox: {
    width: "100%",
    height: 200,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
    overflow: "hidden",
  },
  uploadPlaceholderBoxFilled: {
    borderStyle: "solid",
    borderColor: "#F1F5F9",
    padding: 0,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  uploadPlaceholderText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  successBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  previewFileName: {
    color: "#F1F5F9",
    fontSize: 12,
    fontWeight: "500",
  },

  replaceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 12,
  },
  replaceText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  buttonRow: { flexDirection: "row", gap: 12, marginTop: "auto" },
});