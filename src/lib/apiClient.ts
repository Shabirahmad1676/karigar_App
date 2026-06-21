import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";


const LAPTOP_WIFI_IP = "10.151.82.189"; 

const baseURL = `http://${LAPTOP_WIFI_IP}:3000/api`;

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to every outgoing request automatically
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);