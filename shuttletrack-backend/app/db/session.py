# app/db/session.py
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# SQLite note: check_same_thread for sqlite only
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)


def init_db():
    # import models so SQLModel metadata is populated
    import app.models  # noqa: F401
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
