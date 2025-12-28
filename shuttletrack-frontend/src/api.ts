// src/services/api.ts
import axios from "axios";

// 🚨 NO FALLBACK — FAIL HARD IF ENV IS MISSING
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("🔥 API BASE URL =", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
