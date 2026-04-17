from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.v1.router import api_router
from app.core.database import engine, Base
from app.core.logging import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Seismic Risk Portfolio API...")
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Seismic Risk Portfolio API",
    description="Backend API for Seismic Risk Portfolio Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - Allow frontend from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes only
app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "seismic-risk-backend", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )