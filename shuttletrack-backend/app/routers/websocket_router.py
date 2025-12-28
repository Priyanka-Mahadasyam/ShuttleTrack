from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any, Set, List
import json
import asyncio
import logging

from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


class ConnectionManager:
    """
    Manages WebSocket connections per bus.
    Render free tier friendly:
    - Authenticated connections only
    - Limited subscribers per bus
    """

    def __init__(self):
        self.bus_subscribers: Dict[str, Set[WebSocket]] = {}

    async def _safe_send(self, websocket: WebSocket, payload: str):
        try:
            await websocket.send_text(payload)
        except Exception:
            raise

    async def connect_bus(self, websocket: WebSocket, bus_id: str):
        subs = self.bus_subscribers.setdefault(bus_id, set())

        # 🚨 HARD LIMIT (Render free tier protection)
        if len(subs) >= 5:
            await websocket.close(code=1013)
            return

        await websocket.accept()
        subs.add(websocket)
        logger.info("WS connected → bus %s | subs=%d", bus_id, len(subs))

    def disconnect_bus(self, websocket: WebSocket, bus_id: str):
        subs = self.bus_subscribers.get(bus_id)
        if not subs:
            return
        subs.discard(websocket)
        if not subs:
            self.bus_subscribers.pop(bus_id, None)
        logger.info("WS disconnected → bus %s", bus_id)

    async def broadcast_to_bus(self, bus_id: str, message: Dict[str, Any]):
        subs = list(self.bus_subscribers.get(bus_id, set()))
        if not subs:
            return

        payload = json.dumps(message)
        coros = []

        for ws in subs:
            coros.append(self._safe_send(ws, payload))

        results = await asyncio.gather(*coros, return_exceptions=True)

        for idx, res in enumerate(results):
            if isinstance(res, Exception):
                try:
                    self.disconnect_bus(subs[idx], bus_id)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/subscribe/{bus_id}")
async def websocket_subscribe_bus(websocket: WebSocket, bus_id: str):
    """
    WebSocket endpoint for students/admin to receive live bus updates.
    JWT token is REQUIRED via query param.
    """

    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        role = payload.get("role")

        # 🔐 Allow only valid viewers
        if role not in ("student", "admin"):
            await websocket.close(code=1008)
            return

    except JWTError:
        await websocket.close(code=1008)
        return

    await manager.connect_bus(websocket, str(bus_id))

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_bus(websocket, str(bus_id))
    except Exception as exc:
        logger.exception("WS error bus=%s: %s", bus_id, exc)
        manager.disconnect_bus(websocket, str(bus_id))
