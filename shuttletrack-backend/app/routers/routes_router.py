from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlmodel import Session, select
from app.db.session import get_session
from app import models
from app.schemas import RouteCreate
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from app.core.config import settings

router = APIRouter(prefix="/routes", tags=["routes"])
security = HTTPBearer(auto_error=False)

def get_current_role(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("role")
    except Exception:
        return None

@router.get("", response_model=List[models.Route])
def list_routes(session: Session = Depends(get_session)):
    return session.exec(select(models.Route)).all()

@router.post("", response_model=models.Route)
def create_route(body: RouteCreate, session: Session = Depends(get_session), role: str = Depends(get_current_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    route = models.Route(name=body.name)
    session.add(route)
    session.commit()
    session.refresh(route)
    for s in body.stops or []:
        stop = models.Stop(route_id=route.id, name=s.name, latitude=s.latitude, longitude=s.longitude, order=s.order)
        session.add(stop)
    session.commit()
    session.refresh(route)
    return route

@router.get("/{id}", response_model=models.Route)
def get_route(id: int, session: Session = Depends(get_session)):
    route = session.get(models.Route, id)
    if not route:
        raise HTTPException(status_code=404, detail="Not found")
    return route

@router.put("/{id}", response_model=models.Route)
def update_route(id: int, body: RouteCreate, session: Session = Depends(get_session), role: str = Depends(get_current_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    route = session.get(models.Route, id)
    if not route:
        raise HTTPException(status_code=404, detail="Not found")
    route.name = body.name
    # delete old stops and add new ones
    session.query(models.Stop).filter(models.Stop.route_id == route.id).delete()
    for s in body.stops or []:
        stop = models.Stop(route_id=route.id, name=s.name, latitude=s.latitude, longitude=s.longitude, order=s.order)
        session.add(stop)
    session.add(route)
    session.commit()
    session.refresh(route)
    return route

@router.delete("/{id}", status_code=204)
def delete_route(id: int, session: Session = Depends(get_session), role: str = Depends(get_current_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    route = session.get(models.Route, id)
    if not route:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(route)
    session.commit()
    return {}
