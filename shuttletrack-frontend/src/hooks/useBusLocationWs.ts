// src/hooks/useBusLocationWs.ts
import { useEffect, useRef } from "react";
import { getToken } from "../utils/auth";

export default function useBusLocationWs(
  onMessage: (msg: any) => void,
  busId?: string | number | null
) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    if (!busId) {
      console.log("[WS] No bus selected — skipping connection");
      return;
    }

    // ✅ ALWAYS backend — NO FALLBACK
    const WS_BASE = import.meta.env.VITE_BACKEND_WS_URL;
    if (!WS_BASE) {
      console.warn("[WS] VITE_BACKEND_WS_URL not set");
      return;
    }

    const token = getToken();
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
    const wsUrl = `${WS_BASE}/ws/subscribe/${busId}${tokenParam}`;

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
        } catch {
          console.warn("[WS] Invalid JSON");
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (!alive) return;
        const delay = Math.min(30000, 1000 * 2 ** reconnectAttempts.current++);
        console.warn(`[WS] Closed — reconnecting in ${delay / 1000}s`);
        setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      alive = false;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [busId, onMessage]);
}
