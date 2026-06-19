import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getJobs } from "../../services/job.service";

export default function Bids() {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    // There isn't a dedicated technician bids endpoint; derive from jobs response
    const jobs = await getJobs();
    const collected = [];

    jobs.forEach((job) => {
      if (job.bids && job.bids.length > 0) {
        job.bids.forEach((b) => {
          collected.push({ id: b.id, jobTitle: job.title, amount: b.amount, status: b.status || 'Pending' });
        });
      }
    });

    setBids(collected);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>My Bids</Text>

      <FlatList
        data={bids}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderWidth: 1,
              marginTop: 10,
              borderRadius: 8,
            }}
          >
            <Text>{item.jobTitle}</Text>
            <Text>Amount: {item.amount}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}