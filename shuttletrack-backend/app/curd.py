from sqlmodel import select
from sqlalchemy.orm import Session
from app import models
from app.core.security import get_password_hash

def get_user_by_username(session: Session, username: str):
    return session.exec(select(models.User).where(models.User.username == username)).first()

def create_user(session: Session, username: str, password: str, role: str = "student", email: str | None = None):
    hashed = get_password_hash(password)
    user = models.User(username=username, hashed_password=hashed, role=role, email=email)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
