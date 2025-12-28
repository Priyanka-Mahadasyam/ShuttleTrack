// src/hooks/useBusLocationWs.ts
import { useEffect, useRef } from "react";
import { getToken } from "../utils/auth";

/**
 * useBusLocationWs
 * Opens a per-bus WebSocket: ws://host/ws/subscribe/{bus_id}?token=...
 */
export default function useBusLocationWs(
  onMessage: (msg: any) => void,
  busId?: string | number | null
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);

  useEffect(() => {
    if (!busId) {
      console.log("[WS] No bus selected — skipping connection");
      return;
    }

    const base =
      import.meta.env.VITE_BACKEND_WS_URL ||
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:${location.port ? location.port : (location.protocol === "https:" ? "443" : "80")}`;

    const token = getToken();
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
    const wsUrl = `${base}/ws/subscribe/${busId}${tokenParam}`;

    let alive = true;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] Connected:", wsUrl);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage(data);
        } catch (err) {
          console.warn("[WS] Parse error", err);
        }
      };

      ws.onclose = () => {
        if (!alive) return;
        const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts.current++);
        console.warn(`[WS] Closed — reconnecting in ${delay / 1000}s`);
        setTimeout(connect, delay);
      };

      ws.onerror = (e) => {
        console.error("[WS] Error", e);
        try {
          ws.close();
        } catch {}
      };
    };

    connect();

    return () => {
      alive = false;
      try {
        wsRef.current?.close(1000, "component unmounted");
      } catch {}
      wsRef.current = null;
    };
  }, [busId, onMessage]);
}