from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User
from app.routers import auth, vehicles
from app.security import hash_password


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Optional local admin bootstrap. Never hard-code production credentials.
    if settings.admin_email and settings.admin_password:
        with SessionLocal() as db:
            email = settings.admin_email.lower().strip()
            existing = db.scalar(select(User).where(User.email == email))
            if not existing:
                db.add(User(
                    email=email,
                    full_name="System Administrator",
                    password_hash=hash_password(settings.admin_password),
                    role="admin",
                ))
                db.commit()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth.router)
app.include_router(vehicles.router)


@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}
