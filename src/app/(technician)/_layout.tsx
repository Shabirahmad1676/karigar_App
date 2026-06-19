import { Tabs } from "expo-router";

export default function TechLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="feed" options={{ title: "Jobs Feed" }} />
      <Tabs.Screen name="bids" options={{ title: "My Bids" }} />
    </Tabs>
  );
}