# app/core/config.py
from typing import List

# Pydantic v1: BaseSettings is in pydantic
# Pydantic v2: BaseSettings moved to pydantic-settings package (pydantic_settings)
try:
    from pydantic import BaseSettings
except Exception:
    # pydantic v2 with separate pydantic-settings package
    from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./shuttle.db"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_RANDOM_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    FRONTEND_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
