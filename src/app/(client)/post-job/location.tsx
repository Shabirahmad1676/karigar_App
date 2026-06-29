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
        <Text style={styles.stepIndicator}>Step 2 of 4</Text>
        <Text style={styles.title}>Deployment Target Coordinates</Text>

        <TouchableOpacity 
          style={[styles.gpsButton, formData.latitude ? styles.gpsSuccess : null]} 
          onPress={requestLiveCoordinates}
          disabled={loadingGPS}
          activeOpacity={0.8}
        >
          {loadingGPS ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Ionicon 
                name={formData.latitude ? "location" : "location-outline"} 
                size={24} 
                color={formData.latitude ? theme.colors.success : theme.colors.primary} 
              />
              <Text style={[styles.gpsButtonText, formData.latitude ? styles.textSuccess : null]}>
                {formData.latitude ? "✓ GPS Coordinates Synchronized" : "📍 Capture My Real-Time Location"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {formData.latitude ? (
          <View style={styles.coordinatesDisplayCard}>
            <Text style={styles.coordLabel}>LATITUDE:</Text>
            <Text style={styles.coordValue}>{formData.latitude.toFixed(6)}</Text>
            <Text style={styles.coordLabel}>LONGITUDE:</Text>
            <Text style={styles.coordValue}>{formData.longitude.toFixed(6)}</Text>
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
  safeContainer: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.xl, flex: 1 },
  stepIndicator: { fontSize: 12, fontWeight: "bold", color: theme.colors.primary, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: theme.colors.textPrimary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  gpsButton: { height: 60, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.primary, borderStyle: "dashed", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: theme.spacing.xl, backgroundColor: theme.colors.primaryMuted },
  gpsSuccess: { borderColor: theme.colors.success, backgroundColor: "#DCFCE7", borderStyle: "solid" },
  gpsButtonText: { fontSize: 15, fontWeight: "700", color: theme.colors.primary },
  textSuccess: { color: theme.colors.success },
  coordinatesDisplayCard: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, padding: theme.spacing.md, marginBottom: theme.spacing.xl, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  coordLabel: { fontSize: 11, fontWeight: "700", color: theme.colors.textSecondary, width: "35%", marginBottom: 4 },
  coordValue: { fontSize: 13, fontFamily: "monospace", fontWeight: "700", color: theme.colors.textPrimary, width: "65%", marginBottom: 4 },
  buttonRow: { flexDirection: "row", gap: 15, marginTop: "auto" }
});