# app/routers/buses_router.py
# (Use the full content you already have but ensure the update_location matches the version below.)
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime
from app.db.session import get_session
from app.models import Bus as BusModel
from app.schemas import BusRead, LocationPayload
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings
from app.routers.websocket_router import manager
import asyncio
import logging

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/buses", tags=["buses"])
security = HTTPBearer(auto_error=False)

def decode_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    if not credentials:
        return {}
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload if isinstance(payload, dict) else {}
    except Exception:
        return {}

@router.get("", response_model=List[BusRead])
def list_buses(session: Session = Depends(get_session)):
    buses = session.exec(select(BusModel)).all()
    return buses

@router.get("/{bus_id}", response_model=BusRead)
def get_bus(bus_id: int, session: Session = Depends(get_session)):
    bus = session.get(BusModel, bus_id)
    if not bus:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bus not found")
    return bus

@router.get("/{bus_id}/location")
def get_bus_location(bus_id: int, session: Session = Depends(get_session)):
    bus = session.get(BusModel, bus_id)
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return {
        "bus_id": bus.id,
        "lat": bus.current_lat,
        "lon": bus.current_lon,
        "last_seen": bus.last_seen.isoformat() if bus.last_seen else None,
    }
