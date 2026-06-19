import { useEffect } from "react";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    // later: check JWT + role
    router.replace("/(auth)/login");
  }, []);

  return null;
}