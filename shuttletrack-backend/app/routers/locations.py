# app/routers/locations.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlmodel import Session, select

from app.db.session import get_session
from app.models import Bus, BusLocation
from app.routers.websocket_router import manager  # ✅ ADD THIS

router = APIRouter(prefix="/buses", tags=["buses"])


class LocationIn(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None
    timestamp: Optional[str] = None  # ISO string
    current_stop: Optional[str] = None
    next_stop: Optional[str] = None
    eta: Optional[str] = None
    is_active: Optional[bool] = True
    extra: Optional[dict] = None


@router.post("/{bus_id}/location", status_code=status.HTTP_201_CREATED)
async def post_bus_location(
    bus_id: int,
    payload: LocationIn,
    session: Session = Depends(get_session),
):
    try:
        # ✅ verify bus exists
        bus = session.get(Bus, bus_id)
        if not bus:
            raise HTTPException(status_code=404, detail="Bus not found")

        # ---- timestamp handling ----
        if payload.timestamp:
            try:
                ts = datetime.fromisoformat(payload.timestamp)
            except Exception:
                ts = datetime.utcnow()
        else:
            ts = datetime.utcnow()

        # ---- store location ----
        loc = BusLocation(
            bus_id=bus_id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            is_active=payload.is_active if payload.is_active is not None else True,
            current_stop=payload.current_stop,
            next_stop=payload.next_stop,
            eta=payload.eta,
            extra=payload.extra,
            timestamp=ts,
        )

        session.add(loc)
        session.commit()
        session.refresh(loc)

        # ---- broadcast to subscribers ----
        await manager.broadcast_to_bus(
            str(bus_id),
            {
                "type": "location_update",
                "bus_id": bus_id,
                "latitude": payload.latitude,
                "longitude": payload.longitude,
                "timestamp": ts.isoformat(),
            },
        )

        return {"detail": "ok", "id": loc.id}

    except HTTPException:
        raise
    except Exception:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to store location",
        )
