import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const LAPTOP_WIFI_IP = "10.151.82.189"; 
const HOST = Platform.OS === 'web' ? 'localhost' : LAPTOP_WIFI_IP;

const baseURL = `http://${HOST}:3000/api`;

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Web-safe token retrieval helper
const getAuthToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem("authToken");
  }
  return await SecureStore.getItemAsync("authToken");
};

// Web-safe interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken(); // Safely fetches token depending on platform
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error reading token:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
