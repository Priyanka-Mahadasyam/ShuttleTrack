# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ------------------------------------------------------------------------------
# App init
# ------------------------------------------------------------------------------
app = FastAPI(
    title="ShuttleTrack API",
    version="1.0.0",
)

# ------------------------------------------------------------------------------
# CORS CONFIG (DEV SAFE)
# ------------------------------------------------------------------------------
# ❌ DO NOT use "*" with allow_credentials=True
# ✅ Explicitly allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Root health check
# ------------------------------------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "service": "ShuttleTrack API"}

# ------------------------------------------------------------------------------
# Database init
# ------------------------------------------------------------------------------
from app.db.session import init_db

init_db()

# ------------------------------------------------------------------------------
# Routers (NO defensive loading – FAIL FAST)
# ------------------------------------------------------------------------------
from app.routers.auth import router as auth_router
from app.routers.routes_router import router as routes_router
from app.routers.buses_router import router as buses_router
from app.routers.feedback_router import router as feedback_router
from app.routers.announcements_router import router as announcements_router
from app.routers.websocket_router import router as websocket_router
from app.routers.locations import router as locations_router
from app.routers.user_router import router as users_router
app.include_router(users_router)
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(routes_router, prefix="/routes", tags=["Routes"])
app.include_router(buses_router)
app.include_router(feedback_router, prefix="/feedback", tags=["Feedback"])
app.include_router(announcements_router, prefix="/announcements", tags=["Announcements"])
app.include_router(websocket_router)
app.include_router(locations_router, prefix="/locations", tags=["Locations"])
app.include_router(locations_router)
