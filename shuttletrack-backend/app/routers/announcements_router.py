from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app import models
from app.db.session import get_session
from app.schemas import AnnouncementCreate
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings

router = APIRouter(prefix="/announcements", tags=["announcements"])
security = HTTPBearer(auto_error=False)

def decode_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if not credentials:
        return {}
    try:
        return jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        return {}

@router.get("")
def list_announcements(session: Session = Depends(get_session)):
    return session.exec(select(models.Announcement).order_by(models.Announcement.created_at.desc())).all()

@router.post("", status_code=201)
def post_announcement(data: AnnouncementCreate, session: Session = Depends(get_session), token: dict = Depends(decode_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    ann = models.Announcement(message=data.message)
    session.add(ann)
    session.commit()
    session.refresh(ann)
    return ann
