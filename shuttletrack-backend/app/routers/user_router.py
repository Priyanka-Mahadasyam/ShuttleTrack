from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from app.db.session import get_session
from app.models import User
from app.core.config import settings

router = APIRouter(tags=["users"])
security = HTTPBearer(auto_error=False)

def decode_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)):
    if not credentials:
        return {}
    try:
        return jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        return {}

@router.get("/users")
def list_users(session: Session = Depends(get_session), token: dict = Depends(decode_token)):
    if token.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return session.exec(select(User)).all()
