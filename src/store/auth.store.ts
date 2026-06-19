import { create } from "zustand";
import * as auth from "../services/auth.service";

export const useAuthStore = create((set) => ({
  user: null,

  login: async (email: string, password: string, role?: 'CLIENT' | 'TECHNICIAN') => {
    const data = await auth.login(email, password, role);
    set({ user: data.user });
  },

  register: async (payload: any) => {
    const data = await auth.register(payload);
    set({ user: data.user });
  },

  logout: async () => {
    await auth.logout();
    set({ user: null });
  },
}));