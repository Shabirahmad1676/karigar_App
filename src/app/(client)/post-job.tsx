import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { createJob } from "../../services/job.service";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !budget) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill all fields' });
      return;
    }

    const nb = Number(budget);
    if (!Number.isInteger(nb) || nb <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid budget', text2: 'Enter a positive integer' });
      return;
    }

    try {
      setLoading(true);
      await createJob({ title, description, budget: nb });
      Toast.show({ type: 'success', text1: 'Job posted', text2: 'Technicians will be notified' });
      router.replace("/(client)/home");
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to post job', text2: e.response?.data?.error || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Post a Job</Text>

      <TextInput placeholder="Job Title" value={title} onChangeText={setTitle} style={{ borderWidth: 1, marginTop: 20, padding: 12 }} />

      <TextInput placeholder="Description" multiline value={description} onChangeText={setDescription} style={{ borderWidth: 1, marginTop: 10, padding: 12, height: 100 }} />

      <TextInput placeholder="Budget" keyboardType="numeric" value={budget} onChangeText={setBudget} style={{ borderWidth: 1, marginTop: 10, padding: 12 }} />

      <Pressable onPress={handleSubmit} style={{ backgroundColor: "black", padding: 15, marginTop: 20, alignItems: 'center' }}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>Submit Job</Text>}
      </Pressable>
    </View>
  );
}