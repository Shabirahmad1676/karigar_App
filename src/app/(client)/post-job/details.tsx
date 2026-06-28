import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { theme } from "../../../theme";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useJobFormStore } from "../../../features/services/postJobStore";
import { useAuthGuard } from "../../../hooks/useAuthGuard";
import { apiClient } from "../../../lib/apiClient";

import {SafeAreaView} from "react-native-safe-area-context";
export default function DetailsStep() {
  const router = useRouter();
  const { executeProtectedAction } = useAuthGuard();
  const { formData, updateFields } = useJobFormStore();
  const [errorMsg, setErrorMsg] = useState("");

  // Prompt 4 / 9 Enforce authentication barrier verification right on screen entry
  useEffect(() => {
    executeProtectedAction(() => {
      console.log("Client permissions verified successfully");
    });
  }, []);

  // Fetch true valid service IDs directly from server seeds
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await apiClient.get("/services");
      return res.data;
    },
  });

  const handleNext = () => {
    if (!formData.title || !formData.description || !formData.serviceId) {
      setErrorMsg("Please populate all parameters prior to advancing step workflows.");
      return;
    }
    setErrorMsg("");
    router.push("/(client)/post-job/location");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepIndicator}>Step 1 of 4</Text>
        <Text style={styles.title}>Project Scope Context</Text>

        <Input
          label="Job Title"
          placeholder="e.g. Broken master bathroom valve leak"
          value={formData.title}
          onChangeText={(text) => updateFields({ title: text })}
        />

        <Input
  label="Estimated Working Budget Target (PKR)"
  placeholder="e.g. 2500"
  value={formData.budget}
  onChangeText={(text) => updateFields({ budget: text.replace(/[^0-9]/g, "") })} // Enforce pure numerical entry
  keyboardType="numeric"
/>

        <Input
          label="Detailed Problem Statement Description"
          placeholder="Describe exactly what needs fixing..."
          value={formData.description}
          onChangeText={(text) => updateFields({ description: text })}
          multiline
          numberOfLines={4}
          style={{ height: 100, paddingTop: 10 }}
        />

        {/* Custom Service Selector Grid Elements */}
        <Text style={styles.label}>Select Service Classification</Text>
        <View style={styles.pickerGrid}>
          {services?.map((svc: any) => (
            <Text
              key={svc.id}
              style={[styles.pickerItem, formData.serviceId === svc.id ? styles.pickerItemSelected : null]}
              onPress={() => updateFields({ serviceId: svc.id })}
            >
              {svc.name}
            </Text>
          ))}
        </View>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <Button label="Continue to Location Coordinates" onPress={handleNext} style={styles.navButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.xl },
  stepIndicator: { fontSize: 12, fontWeight: "bold", color: theme.colors.primary, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: theme.colors.textPrimary, marginBottom: theme.spacing.xl, marginTop: theme.spacing.xs },
  label: { fontSize: 14, fontWeight: "500", color: theme.colors.textPrimary, marginBottom: theme.spacing.sm },
  pickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: theme.spacing.xl },
  pickerItem: { padding: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, fontSize: 14, color: theme.colors.textSecondary },
  pickerItemSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryMuted, color: theme.colors.primary, fontWeight: "bold" },
  error: { color: theme.colors.danger, marginBottom: theme.spacing.md, fontSize: 13 },
  navButton: { marginTop: theme.spacing.md },
});