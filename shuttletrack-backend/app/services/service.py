# app/services/user_service.py
from sqlmodel import Session, select
from app import models

def get_user_by_username(session: Session, username: str):
    """
    Service to fetch a user by username.
    Extracted from crud so routers can import it safely at module top level.
    """
    return session.exec(select(models.User).where(models.User.username == username)).first()
