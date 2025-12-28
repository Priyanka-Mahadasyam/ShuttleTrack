// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import { getToken, clearAuth } from "../utils/auth";


const BASE_URL =
  (import.meta.env.VITE_API_URL as string) ?? "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Proper interceptor typing for Axios v1+
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      // Read from sessionStorage per-request so each tab's token is used
      const token = getToken();

      if (token) {
        // Ensure headers object exists
        if (!config.headers) {
          config.headers = {} as any;
        }

        // Add Bearer token safely
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("api interceptor error", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: central 401 handling — clears per-tab auth if unauthorized
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      if (err?.response?.status === 401) {
        clearAuth();
      }
    } catch {}
    return Promise.reject(err);
  }
);

export default api;
