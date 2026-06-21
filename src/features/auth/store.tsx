import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { apiClient } from "../../lib/apiClient";

interface User {
  id: number;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
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
        if (storedToken) {
          // Verify with backend user token decoding mechanisms if necessary
          setToken(storedToken);
          setIsGuest(false);
        } else {
          // Do not auto-mark new users as guests — leave as unauthenticated
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
    setToken(newToken);
    setUser(newUser);
    setIsGuest(false);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    setToken(null);
    setUser(null);
    setIsGuest(true);
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
