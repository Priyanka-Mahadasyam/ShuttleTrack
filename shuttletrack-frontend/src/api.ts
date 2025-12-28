// src/services/api.ts
import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — use `any` for config to avoid Axios/TS mismatch on headers typing
api.interceptors.request.use(
  (config: any) => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (token) {
        if (!config.headers) config.headers = {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore localStorage errors (e.g., SSR)
      // eslint-disable-next-line no-console
      console.warn("api interceptor error", err);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default api;
