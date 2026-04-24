import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  // Lazy import to avoid circular deps — reads store state directly
  const raw = localStorage.getItem("auth-storage");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      const token = parsed?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // malformed storage — ignore
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/");
    // Only force-logout on 401s from protected endpoints, not from login/register itself
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("auth-storage");
      window.location.replace("/login");
    }
    return Promise.reject(err);
  },
);
