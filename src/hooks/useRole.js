import { useAuthStore } from "../store/auth.store";

export const useRole = () => {
  const user = useAuthStore((state) => state.user);

  return {
    role: user?.role,
    isClient: user?.role === "CLIENT",
    isTechnician: user?.role === "TECHNICIAN",
  };
};