// src/constants.ts
export const TOKEN_KEY = "access_token";
export const USER_KEY = "shuttle_user";
// support either VITE_API_BASE or VITE_API_BASE_URL depending on your .env
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

  