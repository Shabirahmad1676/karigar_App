import { Tabs } from "expo-router";
import { theme } from "../../theme";
import { StyleSheet } from "react-native";
import Icon from "@react-native-vector-icons/ionicons"; // Fixed uniform default vector import alignment

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
            <Icon name="search-outline" size={size ?? 24} color={color} />
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
            <Icon name="briefcase-outline" size={size ?? 24} color={color} />
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
            <Icon name="person-outline" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="post-job"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="jobs/[id]"
        options={{
          href: null, 
        }}
      />

      <Tabs.Screen
        name="services/[id]"
        options={{
          href: null, 
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