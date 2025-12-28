// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import { getToken, getUser, saveAuth as saveAuthUtil, clearAuth as clearAuthUtil } from "../utils/auth";

type UserMeta = { username?: string; role?: string } | null;

export default function useAuth() {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<UserMeta>(() => getUser());

  // sessionStorage is per-tab, and storage events don't fire across tabs
  // We poll within-tab to detect other code changes in same tab (safe/light)
  useEffect(() => {
    let mounted = true;
    const sync = () => {
      if (!mounted) return;
      setToken(getToken());
      setUser(getUser());
    };
    const interval = window.setInterval(sync, 500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const saveAuth = useCallback((tok: string, userMeta?: UserMeta) => {
    saveAuthUtil(tok, userMeta ?? null);
    setToken(tok);
    setUser(userMeta ?? null);
  }, []);

  const clearAuth = useCallback(() => {
    clearAuthUtil();
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, saveAuth, clearAuth };
}
