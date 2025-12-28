from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app import models
from app.db.session import get_session
from app.schemas import FeedbackCreate
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

router = APIRouter(tags=["feedback"])
security = HTTPBearer(auto_error=False)

def decode_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if not credentials:
        return {}
    try:
        return jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        return {}

@router.post("", status_code=201)
def submit_feedback(data: FeedbackCreate, session: Session = Depends(get_session), token: dict = Depends(decode_token)):
    user_id = token.get("user_id")
    role = token.get("role")
    if not user_id or role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    fb = models.Feedback(user_id=user_id, bus_id=data.bus_id, rating=data.rating, comments=data.comments)
    session.add(fb)
    session.commit()
    session.refresh(fb)
    return fb

@router.get("")
def list_feedback(session: Session = Depends(get_session), token: dict = Depends(decode_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    items = session.exec(select(models.Feedback)).all()
    return items

@router.put("/{id}/status")
def update_status(id: int, payload: dict, session: Session = Depends(get_session), token: dict = Depends(decode_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    fb = session.get(models.Feedback, id)
    if not fb:
        raise HTTPException(status_code=404, detail="Not found")
    fb.status = payload.get("status", fb.status)
    session.add(fb)
    session.commit()
    session.refresh(fb)
    return fb
