import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getServices } from "../../services/service.service";

export default function Home() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const data = await getServices();
    setServices(data);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        Services Feed
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderWidth: 1, marginTop: 10 }}>
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}