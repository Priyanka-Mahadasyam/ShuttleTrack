# app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas import Token, AuthRequest
from app.services.user_service import get_user_by_username
from app.core.security import verify_password, create_access_token

router = APIRouter(tags=["Auth"])

@router.post("/login", response_model=Token)
@router.post("/login", response_model=Token)
def login(payload: AuthRequest, session: Session = Depends(get_session)):
    user = get_user_by_username(session, payload.username)

    print("LOGIN USERNAME:", payload.username)
    print("USER FROM DB:", user)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role,
            "user_id": user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

    user = get_user_by_username(session, payload.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": user.username,
            "role": user.role,
            "user_id": user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }
