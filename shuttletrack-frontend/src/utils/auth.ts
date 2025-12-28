// src/utils/auth.ts
export const TOKEN_KEY = "shuttle_token";
export const USER_KEY = "shuttle_user";

/**
 * Save token + user meta to sessionStorage (per-tab).
 */
export function saveAuth(token: string, userMeta?: Record<string, any> | null) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    if (userMeta) sessionStorage.setItem(USER_KEY, JSON.stringify(userMeta));
    else sessionStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("saveAuth failed", e);
  }
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getUser(): Record<string, any> | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {}
}
