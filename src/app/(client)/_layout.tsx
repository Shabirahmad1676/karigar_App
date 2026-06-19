import { Tabs } from 'expo-router';
import Ionicons from '@react-native-vector-icons/ionicons'; 

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          )
        }} 
      />

      <Tabs.Screen 
        name="post-job" 
        options={{ 
          title: "Post Job",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={24} color={color} />
          )
        }} 
      />

      <Tabs.Screen 
        name="my-jobs" 
        options={{ 
          title: "My Jobs",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "briefcase" : "briefcase-outline"} size={24} color={color} />
          )
        }} 
      />

    </Tabs>
  );
}
