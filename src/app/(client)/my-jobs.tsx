import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { getJobs } from "../../services/job.service";
import { acceptBid } from "../../services/bid.service";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/auth.store";

export default function MyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({} as Record<number, boolean>);
  const [acceptedIds, setAcceptedIds] = useState<Record<number, boolean>>({} as Record<number, boolean>);
  const user = useAuthStore((s: any) => s.user);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await getJobs();
      // filter to only jobs owned by current user
      const my = user ? data.filter((j: any) => j.client && j.client.id === user.id) : [];
      setJobs(my);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to load jobs', text2: e.response?.data?.error || e.message });
    }
  };

  const handleAccept = async (jobId: number, bidId: number) => {
    try {
      setLoadingMap((p) => ({ ...p, [bidId]: true }));
      await acceptBid(jobId, bidId);
      Toast.show({ type: 'success', text1: 'Bid accepted', text2: 'Technician notified' });
      setAcceptedIds((p) => ({ ...p, [bidId]: true }));
      await loadJobs();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Accept failed', text2: e.response?.data?.error || e.message });
    } finally {
      setLoadingMap((p) => ({ ...p, [bidId]: false }));
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>My Jobs</Text>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 8,
            }}
          >
            <Text>{item.title}</Text>
            {item.bids && item.bids.length > 0 && (
              item.bids.map((b: any) => (
                <View key={b.id} style={{ marginTop: 8 }}>
                  <Text>Bid by: {b.technician?.name || 'Tech'} — Amount: {b.amount}</Text>
                  <Pressable
                    onPress={() => handleAccept(item.id, b.id)}
                    style={{ backgroundColor: acceptedIds[b.id] ? 'gray' : 'green', padding: 8, marginTop: 6 }}
                    disabled={Boolean(acceptedIds[b.id]) || Boolean(loadingMap[b.id])}
                  >
                    {loadingMap[b.id] ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ color: 'white' }}>{acceptedIds[b.id] ? 'Accepted' : 'Accept'}</Text>
                    )}
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}
      />
    </View>
  );
}