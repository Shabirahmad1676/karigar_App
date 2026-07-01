import React from "react";
import { Stack } from "expo-router";
import { JobStoreProvider } from "../../features/services/postJobStore";

export default function ClientGroupRootLayout() {
  return (
    <JobStoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Mounts the sub-tabs navigation file layout safely */}
        <Stack.Screen name="(tabs)" />
        
        {/* Dynamic sub-service selection screen now has safe context access! */}
        <Stack.Screen name="services/[id]" />
        
        {/* Post-Job Multi-Step Wizard Layout Sub-Folder */}
        <Stack.Screen name="post-job" />
        
        {/* Client Booking Details Inspector */}
        <Stack.Screen name="jobs/[id]" />
      </Stack>
    </JobStoreProvider>
  );
}