# app/seed_data.py
from typing import List, Dict, Any, Optional
from sqlmodel import Session
from app.db.session import engine, init_db
from app import models
from app.core.security import get_password_hash

def ensure_user(session: Session, username: str, password: str, role: str, email: str):
    user = session.exec(models.User.__table__.select().where(models.User.username == username)).first()
    if user:
        return user
    user = models.User(username=username, hashed_password=get_password_hash(password), role=role, email=email)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def ensure_route(session: Session, name: str):
    route = session.exec(models.Route.__table__.select().where(models.Route.name == name)).first()
    if not route:
        route = models.Route(name=name)
        session.add(route)
        session.commit()
        session.refresh(route)
    return route

def ensure_stop(session: Session, route_id: int, name: str, latitude: float = 0.0, longitude: float = 0.0, order: int = 0):
    stop = session.exec(models.Stop.__table__.select().where((models.Stop.route_id == route_id) & (models.Stop.name == name))).first()
    if not stop:
        stop = models.Stop(route_id=route_id, name=name, latitude=latitude, longitude=longitude, order=order)
        session.add(stop)
        session.commit()
        session.refresh(stop)
    return stop

def ensure_bus(session: Session, name: str, route_id: int, driver_id: Optional[int] = None):
    bus = session.exec(models.Bus.__table__.select().where(models.Bus.name == name)).first()
    if not bus:
        bus = models.Bus(name=name, route_id=route_id, driver_id=driver_id)
        session.add(bus)
        session.commit()
        session.refresh(bus)
    return bus

def main():
    init_db()
    from sqlmodel import Session as S
    with S(engine) as session:
        admin = ensure_user(session, "admin", "adminpass", "admin", "admin@example.com")
        driver1 = ensure_user(session, "driver1", "driverpass", "driver", "driver1@example.com")
        student1 = ensure_user(session, "student1", "studentpass", "student", "student1@example.com")

        ROUTES = {
            "A Bus": {
                "stops": ["NAD", "Gopalapatnam", "Naiduthota", "Vepagunta", "Pendurthi", "Anandapuram", "College"],
                "timings": ["07:00 AM","08:00 AM","09:00 AM","04:00 PM","05:00 PM","06:00 PM"]
            },
            "N Bus": {
                "stops": ["NAD", "Gopalapatnam", "Naiduthota", "Vepagunta", "Pendurthi", "Kottavalasa", "College"],
                "timings": ["07:15 AM","08:15 AM","09:15 AM","04:15 PM","05:15 PM","06:15 PM"]
            },
        }

        for route_name, payload in ROUTES.items():
            route = ensure_route(session, route_name)
            for idx, stop_name in enumerate(payload.get("stops", []), start=1):
                ensure_stop(session, route.id, stop_name, latitude=0.0, longitude=0.0, order=idx)
            ensure_bus(session, route_name, route.id, driver1.id if driver1 else None)

        print("Seeding complete.")

if __name__ == "__main__":
    main()
