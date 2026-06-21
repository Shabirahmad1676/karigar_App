import React, { useState } from "react";
import { View, Text, StyleSheet} from "react-native";
import { useRouter } from "expo-router";

import {SafeAreaView} from "react-native-safe-area-context";
import { theme } from "../../../theme";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useJobFormStore } from "../../../features/services/postJobStore";

export default function LocationStep() {
  const router = useRouter();
  const { formData, updateFields } = useJobFormStore();
  const [fetchingLoc, setFetchingLoc] = useState(false);

  const simulateDeviceLocationCapture = () => {
    setFetchingLoc(true);
    // Simulates standard GPS lookup matching Pakistan regions safely
    setTimeout(() => {
      updateFields({
        latitude: 34.1989,
        longitude: 72.0497,
        address: "Sector C, Sheikh Maltoon Town, Mardan, KP",
      });
      setFetchingLoc(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Step 2 of 4</Text>
        <Text style={styles.title}>Deployment Target Location</Text>

        <Button
          label={fetchingLoc ? "Interrogating Satellite GPS..." : "📍 Use Current Device Location Coordinates"}
          onPress={simulateDeviceLocationCapture}
          variant="secondary"
          style={{ marginBottom: theme.spacing.xl }}
        />

        {formData.latitude && (
          <View style={styles.coordinatesBlock}>
            <Text style={styles.coordsText}>Latitude: {formData.latitude}</Text>
            <Text style={styles.coordsText}>Longitude: {formData.longitude}</Text>
          </View>
        )}

        <Input
          label="Verified Structural Street Address"
          placeholder="e.g. House 45, Street 3, Block C..."
          value={formData.address}
          onChangeText={(text) => updateFields({ address: text })}
        />

        <View style={styles.buttonRow}>
          <Button label="Back" onPress={() => router.back()} variant="ghost" style={{ flex: 1 }} />
          <Button label="Next Step" onPress={() => router.push("/(client)/post-job/photos")} style={{ flex: 2 }} />
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
  coordinatesBlock: { padding: 12, backgroundColor: theme.colors.border, borderRadius: 8, marginBottom: theme.spacing.md },
  coordsText: { fontSize: 13, color: theme.colors.textPrimary, fontFamily: "monospace" },
  buttonRow: { flexDirection: "row", gap: 15, marginTop: "auto" },
});