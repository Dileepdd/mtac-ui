import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredTokens(): { token: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return { token: null, refreshToken: null };
    const parsed = JSON.parse(raw) as { state?: { token?: string; refreshToken?: string } };
    return {
      token:        parsed?.state?.token        ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    };
  } catch {
    return { token: null, refreshToken: null };
  }
}

function updateStoredToken(newToken: string) {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    if (parsed?.state) {
      parsed.state.token = newToken;
      localStorage.setItem("auth-storage", JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

function forceLogout() {
  localStorage.removeItem("auth-storage");
  window.location.replace("/login");
}

// ─── Request interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const { token } = getStoredTokens();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — with silent token refresh ────────────────────────

let isRefreshing = false;
// Queue of callbacks waiting for the new token
let waitingQueue: Array<(token: string | null) => void> = [];

function flushQueue(newToken: string | null) {
  waitingQueue.forEach((cb) => cb(newToken));
  waitingQueue = [];
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as typeof err.config & { _retried?: boolean };
    const status   = err.response?.status;
    const url      = original?.url ?? "";
    const isAuthEndpoint = url.includes("/auth/");

    // Only attempt refresh on 401s from protected endpoints (not login/register/refresh)
    if (status !== 401 || isAuthEndpoint || original._retried) {
      if (status === 401 && !isAuthEndpoint) forceLogout();
      return Promise.reject(err);
    }

    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(err);
    }

    // Mark this request so we don't retry it again
    original._retried = true;

    if (isRefreshing) {
      // Another refresh is already in flight — queue this request
      return new Promise((resolve, reject) => {
        waitingQueue.push((newToken) => {
          if (!newToken) { reject(err); return; }
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post<{ data: { accessToken: string } }>(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      );
      const newToken = res.data.data.accessToken;

      updateStoredToken(newToken);
      flushQueue(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      flushQueue(null);
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
