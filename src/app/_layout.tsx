import { Slot } from "expo-router";
import { AuthProvider } from "../features/auth/store";
import { AuthGateModal } from "../components/shared/AuthGateModel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes cache lifetime
    },
  },
});



export default function RootLayout() {
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* App Content routing layout slot */}
      <Slot />
      
      {/* Global state-controlled bottom sheet container */}
      <AuthGateModal />
    </AuthProvider>
  </QueryClientProvider>
  );
}