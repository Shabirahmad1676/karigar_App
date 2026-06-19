import axios from "axios";
import { getToken } from "../utils/token";

const api = axios.create({
  baseURL: "http://10.151.82.189:3000/api",
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;