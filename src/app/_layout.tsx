import { Stack } from "expo-router";
import { useSocket } from "../hooks/useSocket";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  useSocket(); // 🔥 global realtime listener

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </>
  );
}