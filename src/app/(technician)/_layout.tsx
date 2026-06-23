import { Tabs } from "expo-router";
import { theme } from "../../theme";
import { StyleSheet } from "react-native";
import Ionicon from "@react-native-vector-icons/ionicons";

export default function TechnicianTabsLayout() {
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
      {/* 1. Public Unassigned Job Board Marketplace */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Job Board",
          tabBarLabel: "Available Jobs",
          tabBarIcon: ({ color, size }) => (
            <Ionicon name="build-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      {/* 2. Technician Professional Profile & Dissemination Logs */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarLabel: "Ledger Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicon name="construct-outline" size={size ?? 24} color={color} />
          ),
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