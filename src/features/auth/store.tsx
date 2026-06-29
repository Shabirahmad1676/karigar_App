import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../../lib/apiClient";
import { socket } from "../../lib/socketClient";


interface User {
  id: number;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN" | "TECHNICIAN";
  phone?: string;
  verificationStatus?: string
  isVerified?: boolean;
  isWorking?: boolean;
  tier?: "FREE" | "PREMIUM";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setAsGuest: () => void;
  triggerAuthModal: (() => void) | null;
  registerModalTrigger: (trigger: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [triggerAuthModal, setTriggerAuthModal] = useState<(() => void) | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("authToken");
        const storedUser = await SecureStore.getItemAsync("authUser"); 
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsGuest(false);
          
          // Asynchronously attempt to decode/fetch active user details from server targets
          try {
            const res = await apiClient.get("/jobs/my"); // Safe query to verify token validation
            // If valid, open socket connection streams
            socket.connect();
          } catch (apiErr) {
            console.warn("Token validation failed on boot, skipping socket auto-connect.");
          }
        } else {
          setIsGuest(false);
        }
      } catch (e) {
        console.error("Failed to restore token", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await SecureStore.setItemAsync("authToken", newToken);
    await SecureStore.setItemAsync("authUser", JSON.stringify(newUser)); 
    setToken(newToken);
    setUser(newUser);
    setIsGuest(false);

    // Initialize real-time infrastructure and execute room alignment handshakes
    socket.connect();
    socket.emit("join", { userId: newUser.id, role: newUser.role });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("authUser");
    setToken(null);
    setUser(null);
    setIsGuest(true);

    // Disconnect stream interfaces securely to block unauthorized background events
    socket.disconnect();
  };

  const setAsGuest = () => {
    setIsGuest(true);
  };

  const registerModalTrigger = (trigger: () => void) => {
    setTriggerAuthModal(() => trigger);
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, isGuest, isLoading, login, logout, setAsGuest, triggerAuthModal, registerModalTrigger 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};