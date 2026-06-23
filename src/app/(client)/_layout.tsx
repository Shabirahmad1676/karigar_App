import { Tabs } from "expo-router";
import { theme } from "../../theme";
import { StyleSheet } from "react-native";
import Ionicon from "@react-native-vector-icons/ionicons";

export default function ClientTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {/* 1. Home / Marketplace Hub Screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Marketplace",
          tabBarLabel: "Find Hub",
          tabBarIcon: ({ color, size }) => (
            <Ionicon name="search-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* 2. Real-Time Bookings Screen Ledger */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: "My Bookings",
          tabBarLabel: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicon name="briefcase-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* 3. Account Settings Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicon name="person-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* Hide the multi-step post-job wizard flow from appearing in the main bottom menu bar */}
      <Tabs.Screen
        name="post-job"
        options={{
          href: null,
        }}
      />

      {/* Append this configuration option directly inside your client folder layout file */}
      <Tabs.Screen
        name="jobs/[id]"
        options={{
          href: null, // Instructs Expo Router to keep this file active but block it from drawing an icon on the bottom panel
        }}
      />

      {/* Put this block alongside your other Tabs.Screen configuration parameters */}
      <Tabs.Screen
        name="services/[id]"
        options={{
          href: null, // Keeps the page accessible via routing, but completely hidden from drawing an extra icon in the bottom menu bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
