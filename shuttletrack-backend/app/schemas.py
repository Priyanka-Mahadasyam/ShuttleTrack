# app/schemas.py
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# Auth / Token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AuthRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = "student"  # optional role during login

# User read
class UserRead(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: Optional[str] = "student"

    class Config:
        from_attributes = True

# Stop / Route
class StopRead(BaseModel):
    id: int
    route_id: Optional[int] = None
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    order: Optional[int] = None

    class Config:
        from_attributes = True

class RouteRead(BaseModel):
    id: int
    name: str
    stops: Optional[List[StopRead]] = []

    class Config:
        from_attributes = True

class RouteCreate(BaseModel):
    name: str
    stops: Optional[List[Dict[str, Any]]] = []

# Bus
class BusRead(BaseModel):
    id: int
    name: Optional[str] = None
    route_id: Optional[int] = None
    driver_id: Optional[int] = None
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None
    last_seen: Optional[datetime] = None
    route: Optional[RouteRead] = None
    stops: Optional[List[StopRead]] = None

    class Config:
        from_attributes = True

# Location payload
class LocationPayload(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    current_stop: Optional[str] = None
    next_stop: Optional[str] = None
    eta: Optional[str] = None
    timestamp: Optional[str] = None
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None

    def canonical_lat(self) -> Optional[float]:
        return self.lat if self.lat is not None else self.latitude

    def canonical_lon(self) -> Optional[float]:
        return self.lon if self.lon is not None else self.longitude

# Feedback
class FeedbackCreate(BaseModel):
    bus_id: int
    rating: str
    comments: Optional[str] = None

class FeedbackRead(FeedbackCreate):
    id: int
    user_id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Announcement
class AnnouncementCreate(BaseModel):
    message: str

class AnnouncementRead(BaseModel):
    id: int
    message: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
