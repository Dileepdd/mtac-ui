import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { applySettingsHierarchy } from "@/config/colors";
import { useAuthStore } from "@/stores/authStore";
import "./index.css";
import App from "./App.tsx";

applySettingsHierarchy();

// Clear auth state if the refresh token is already expired — prevents showing
// a logged-in UI that will be immediately force-logged-out on first API call.
(function clearExpiredSession() {
  const { refreshToken, clearAuth } = useAuthStore.getState();
  if (!refreshToken) return;
  try {
    const payload = JSON.parse(atob(refreshToken.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) clearAuth();
  } catch {
    clearAuth();
  }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
