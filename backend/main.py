from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from models import User, Parcel

from auth import router as auth_router
from captain import router as captain_router
from parcel import router as parcel_router
from admin import router as admin_router
from websocket import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    yield


app = FastAPI(
    title="Parcel Delivery System API",
    description="Backend API for the Parcel Delivery System",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(captain_router)
app.include_router(parcel_router)
app.include_router(admin_router)
app.include_router(websocket_router)


@app.get("/")
def root():
    return {
        "message": "Parcel Delivery System API is running",
        "status": "success"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }