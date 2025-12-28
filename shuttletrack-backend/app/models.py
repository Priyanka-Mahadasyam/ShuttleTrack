# app/models.py
from typing import Optional, List, Dict
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: Optional[str] = None
    hashed_password: str
    role: str = Field(default="student")  # student | admin | driver

    buses: List["Bus"] = Relationship(back_populates="driver")


class Route(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    stops: List["Stop"] = Relationship(back_populates="route")
    buses: List["Bus"] = Relationship(back_populates="route")


class Stop(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    route_id: int = Field(foreign_key="route.id")
    name: str
    latitude: float = Field(default=0.0)
    longitude: float = Field(default=0.0)
    order: int = Field(default=0)

    route: Optional[Route] = Relationship(back_populates="stops")


class Bus(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    route_id: Optional[int] = Field(default=None, foreign_key="route.id")
    driver_id: Optional[int] = Field(default=None, foreign_key="user.id")
    current_lat: Optional[float] = Field(default=None)
    current_lon: Optional[float] = Field(default=None)
    last_seen: Optional[datetime] = Field(default=None)

    route: Optional[Route] = Relationship(back_populates="buses")
    driver: Optional[User] = Relationship(back_populates="buses")


class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    bus_id: int = Field(foreign_key="bus.id")
    rating: str
    comments: Optional[str] = None
    status: str = Field(default="new")


class Announcement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# BusLocation appended at end (sa_column JSON WITHOUT nullable arg)
class BusLocation(SQLModel, table=True):
    __tablename__ = "buslocation"

    id: Optional[int] = Field(default=None, primary_key=True)
    bus_id: int = Field(index=True)
    latitude: float
    longitude: float
    is_active: bool = Field(default=True)
    current_stop: Optional[str] = Field(default=None)
    next_stop: Optional[str] = Field(default=None)
    eta: Optional[str] = Field(default=None)
    extra: Optional[Dict] = Field(default=None, sa_column=Column(JSON))
    timestamp: Optional[datetime] = Field(default=None)
