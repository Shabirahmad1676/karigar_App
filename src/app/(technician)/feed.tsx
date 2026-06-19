import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { getJobs } from "../../services/job.service";
import { createBid } from "../../services/bid.service";
import Toast from "react-native-toast-message";

export default function Feed() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({} as Record<number, string>);
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({} as Record<number, boolean>);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Failed to load jobs", text2: e.response?.data?.error || e.message });
    }
  };

  const handleBid = async (jobId: number) => {
    const raw = amounts[jobId];
    const amount = Number(raw);

    if (!raw) {
      Toast.show({ type: "error", text1: "Amount required", text2: "Please enter a bid amount" });
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      Toast.show({ type: "error", text1: "Invalid amount", text2: "Enter a positive integer amount" });
      return;
    }

    try {
      setLoadingMap((p) => ({ ...p, [jobId]: true }));
      await createBid(jobId, amount);
      Toast.show({ type: "success", text1: "Bid placed", text2: `Your bid of ${amount} was placed` });
      setAmounts((p) => ({ ...p, [jobId]: "" }));
      await loadJobs();
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Bid failed", text2: e.response?.data?.error || e.message });
    } finally {
      setLoadingMap((p) => ({ ...p, [jobId]: false }));
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Jobs Feed</Text>

      <FlatList
        data={jobs}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderWidth: 1, marginTop: 10 }}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>Budget: {item.budget}</Text>

            <TextInput
              placeholder="Your bid amount"
              keyboardType="numeric"
              value={amounts[item.id] ?? ""}
              onChangeText={(t) => setAmounts((p) => ({ ...p, [item.id]: t }))}
              style={{ borderWidth: 1, marginTop: 10, padding: 8 }}
            />

            <Pressable
              onPress={() => handleBid(item.id)}
              style={{
                backgroundColor: "black",
                padding: 10,
                marginTop: 10,
                alignItems: "center",
              }}
            >
              {loadingMap[item.id] ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white" }}>Place Bid</Text>
              )}
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}