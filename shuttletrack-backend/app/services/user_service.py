# app/services/user_service.py
from sqlmodel import Session, select
from app import models

def get_user_by_username(session: Session, username: str):
    """
    Returns a User object or None.
    Kept in services so routers can import it at module top-level
    without causing circular import issues.
    """
    return session.exec(select(models.User).where(models.User.username == username)).first()
