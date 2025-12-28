from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any, Set
import json
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


class ConnectionManager:
    """
    Manage websocket connections:
    - global_connections: list of websockets that receive broadcast_all
    - bus_subscribers: map bus_id -> set of websockets subscribed to that bus
    """

    def __init__(self):
        self.global_connections: List[WebSocket] = []
        self.bus_subscribers: Dict[str, Set[WebSocket]] = {}

    async def _safe_send(self, websocket: WebSocket, payload: str):
        try:
            await websocket.send_text(payload)
        except Exception as e:
            logger.debug("send failed: %s", e)
            raise

    # Global connections (admin / debug)
    async def connect_global(self, websocket: WebSocket):
        await websocket.accept()
        self.global_connections.append(websocket)
        logger.info("Global WS connected. Total global: %d", len(self.global_connections))

    def disconnect_global(self, websocket: WebSocket):
        try:
            self.global_connections.remove(websocket)
        except ValueError:
            pass
        logger.info("Global WS disconnected. Total global: %d", len(self.global_connections))

    # Bus-specific subscription
    async def connect_bus(self, websocket: WebSocket, bus_id: str):
        await websocket.accept()
        subs = self.bus_subscribers.setdefault(str(bus_id), set())
        subs.add(websocket)
        logger.info("WS subscribed to bus %s. Subscribers: %d", bus_id, len(subs))

    def disconnect_bus(self, websocket: WebSocket, bus_id: str):
        subs = self.bus_subscribers.get(str(bus_id))
        if not subs:
            return
        if websocket in subs:
            subs.remove(websocket)
            logger.info("WS unsubscribed from bus %s. Remaining: %d", bus_id, len(subs))
        if not subs:
            self.bus_subscribers.pop(str(bus_id), None)

    # broadcast to all global connections
    async def broadcast_all(self, message: Dict[str, Any]):
        payload = json.dumps(message)
        coros = []
        for conn in list(self.global_connections):
            try:
                coros.append(self._safe_send(conn, payload))
            except Exception:
                pass
        if coros:
            results = await asyncio.gather(*coros, return_exceptions=True)
            # best-effort cleanup
            for i, res in enumerate(results):
                if isinstance(res, Exception):
                    try:
                        conn = self.global_connections[i]
                        self.disconnect_global(conn)
                    except Exception:
                        pass

    # broadcast to subscribers of a single bus
    async def broadcast_to_bus(self, bus_id: str, message: Dict[str, Any]):
        payload = json.dumps(message)
        subs = list(self.bus_subscribers.get(str(bus_id), set()))
        if not subs:
            logger.debug("No subscribers for bus %s", bus_id)
            return
        coros = []
        for conn in subs:
            try:
                coros.append(self._safe_send(conn, payload))
            except Exception:
                pass
        if coros:
            results = await asyncio.gather(*coros, return_exceptions=True)
            for idx, res in enumerate(results):
                if isinstance(res, Exception):
                    try:
                        bad_conn = subs[idx]
                        self.disconnect_bus(bad_conn, bus_id)
                    except Exception:
                        pass


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_global(websocket: WebSocket):
    await manager.connect_global(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_global(websocket)
    except Exception as exc:
        logger.exception("WS global error: %s", exc)
        manager.disconnect_global(websocket)


@router.websocket("/ws/subscribe/{bus_id}")
async def websocket_subscribe_bus(websocket: WebSocket, bus_id: str):
    await manager.connect_bus(websocket, bus_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_bus(websocket, bus_id)
    except Exception as exc:
        logger.exception("WS bus error (%s): %s", bus_id, exc)
        manager.disconnect_bus(websocket, bus_id)
