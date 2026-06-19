import api from "./api";
import { saveToken, removeToken } from "../utils/token";

export const login = async (email: string, password: string, role?: string) => {
  const res = await api.post("/auth/login", {
    email,
    password,
    role,
  });

  await saveToken(res.data.token);

  return res.data;
};

export const register = async (data: any) => {
  const res = await api.post("/auth/register", data);

  await saveToken(res.data.token);

  return res.data;
};

export const logout = async () => {
  await removeToken();
};