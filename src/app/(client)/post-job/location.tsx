import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location"; // 📦 Native Hardware Location Hook
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicon from "@react-native-vector-icons/ionicons";

export default function LocationStep() {
  const router = useRouter();
  const { formData, updateFields } = useJobFormStore();
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  // Fallback operational baseline coordinates (Mardan Center)
  const FALLBACK_LAT = 34.1989;
  const FALLBACK_LNG = 72.0497;

  // Request location coordinates from device hardware sensors
  const requestLiveCoordinates = async () => {
    setLoadingGPS(true);
    try {
      // 1. Request hardware runtime permission from the operating system
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access was denied. Falling back to default baseline city coordinates.",
          [
            {
              text: "OK",
              onPress: () => {
                updateFields({
                  latitude: FALLBACK_LAT,
                  longitude: FALLBACK_LNG,
                  address: formData.address || "Mardan Operational Area"
                });
              }
            }
          ]
        );
        return;
      }

      // 2. Fetch current exact spatial coordinates from satellite positioning hardware
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Attempt inverse geocoding to resolve a readable street string descriptor
      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
      let formattedAddress = "";
      if (geocode) {
        const name = geocode.name || "";
        const street = geocode.street || "";
        const district = geocode.district || "";
        const city = geocode.city || "";
        formattedAddress = `${name} ${street}, ${district}, ${city}`.trim().replace(/^,\s*|,\s*$/g, "");
      }

      updateFields({
        latitude,
        longitude,
        address: formattedAddress || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      });

      Alert.alert("Success", "Live device GPS coordinates synchronized safely!");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Hardware Error", "Could not capture satellite signals. Please check phone location status.");
    } finally {
      setLoadingGPS(false);
    }
  };

  const handleNext = () => {
    if (!formData.latitude || !formData.longitude || !formData.address) {
      Alert.alert("Missing Location", "Please click the button to acquire your coordinates before advancing.");
      return;
    }
    router.push("/(client)/post-job/photos");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.progressHeader}>
          <Text style={styles.stepIndicator}>Step 2 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "50%" }]} />
          </View>
        </View>
        <Text style={styles.title}>Deployment Target Coordinates</Text>

        <TouchableOpacity
          style={[styles.gpsButton, formData.latitude ? styles.gpsSuccess : null]}
          onPress={requestLiveCoordinates}
          disabled={loadingGPS}
          activeOpacity={0.7}
        >
          {loadingGPS ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <View style={[styles.gpsIconCircle, formData.latitude ? styles.gpsIconCircleSuccess : null]}>
                <Ionicon
                  name={formData.latitude ? "location" : "location-outline"}
                  size={20}
                  color={formData.latitude ? theme.colors.success : theme.colors.primary}
                />
              </View>
              <Text style={[styles.gpsButtonText, formData.latitude ? styles.textSuccess : null]}>
                {formData.latitude ? "GPS Coordinates Synchronized" : "Capture My Real-Time Location"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {formData.latitude ? (
          <View style={styles.coordinatesDisplayCard}>
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>LATITUDE</Text>
              <Text style={styles.coordValue}>{formData.latitude.toFixed(6)}</Text>
            </View>
            <View style={styles.coordDivider} />
            <View style={styles.coordItem}>
              <Text style={styles.coordLabel}>LONGITUDE</Text>
              <Text style={styles.coordValue}>{formData.longitude.toFixed(6)}</Text>
            </View>
          </View>
        ) : null}

        <Input
          label="Detailed Street Address / Landmark Reference"
          placeholder="e.g. House 12, Sector A, Near Central Mosque..."
          value={formData.address}
          onChangeText={(text) => updateFields({ address: text })}
        />

        <View style={styles.buttonRow}>
          <Button label="Back" onPress={() => router.back()} variant="ghost" style={{ flex: 1 }} />
          <Button label="Continue to Next Step" onPress={handleNext} style={{ flex: 2 }} />
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

  gpsButton: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },
  gpsSuccess: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    borderStyle: "solid",
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  gpsIconCircleSuccess: {
    backgroundColor: "#DCFCE7",
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  textSuccess: {
    color: theme.colors.success,
  },

  coordinatesDisplayCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  coordItem: { flex: 1 },
  coordDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "600",
    color: "#0F172A",
  },

  buttonRow: { flexDirection: "row", gap: 12, marginTop: "auto" },
});