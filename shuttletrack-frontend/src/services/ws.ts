// src/services/ws.ts
export function createWs(onMessage: (msg: any) => void, onOpen?: () => void, onClose?: () => void) {
  const WS_BASE = (import.meta.env.VITE_WS_BASE as string) ?? `${location.protocol === "https:" ? "wss" : "ws"}://127.0.0.1:8000`;
  const ws = new WebSocket(`${WS_BASE}/ws`);

  ws.onopen = () => { onOpen?.(); console.log("[WS] global open"); };
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data)); } catch (e) { console.error("WS parse error", e); }
  };
  ws.onclose = () => { onClose?.(); console.log("[WS] global closed"); };
  ws.onerror = (e) => console.error("[WS] error", e);
  return ws;
}
