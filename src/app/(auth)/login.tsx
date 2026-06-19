import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { router, useRouter } from "expo-router";
import Toast from "react-native-toast-message";


export default function Login() {
  const login = useAuthStore((s: any) => s.login);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'CLIENT' | 'TECHNICIAN'>('CLIENT');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please enter email and password' });
      return;
    }

    try {
      setLoading(true);
      await login(email, password, role);
      Toast.show({ type: 'success', text1: 'Logged in' });
      // Redirect based on selected role
      if (role === 'CLIENT') {
        router.replace("/(client)/home");
      } else {
        router.replace("/(technician)/feed");
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Login</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, marginTop: 20, padding: 12 }} />

      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginTop: 10, padding: 12 }} />

        <View style={{ marginTop: 12 }}>
          <Text style={{ marginBottom: 6 }}>Role</Text>
          <View style={{ flexDirection: 'row' }}>
            <Pressable onPress={() => setRole('CLIENT')} style={{ padding: 10, borderWidth: 1, marginRight: 8, backgroundColor: role === 'CLIENT' ? 'black' : 'white' }}>
              <Text style={{ color: role === 'CLIENT' ? 'white' : 'black' }}>Client</Text>
            </Pressable>
            <Pressable onPress={() => setRole('TECHNICIAN')} style={{ padding: 10, borderWidth: 1, backgroundColor: role === 'TECHNICIAN' ? 'black' : 'white' }}>
              <Text style={{ color: role === 'TECHNICIAN' ? 'white' : 'black' }}>Technician</Text>
            </Pressable>
          </View>
        </View>

      <Pressable onPress={handleLogin} style={{ backgroundColor: "black", padding: 15, marginTop: 20, alignItems: 'center' }}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>Login</Text>}
      </Pressable>

      <View style={{flexDirection:'row'}}>
        <Text>Don't have an Account?</Text>
      <Pressable><Text onPress={() => router.push("/(auth)/register")}>SignUp</Text></Pressable>
      </View>
    </View>
  );
}