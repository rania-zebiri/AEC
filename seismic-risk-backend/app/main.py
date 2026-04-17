from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.config import settings
from app.api.v1.router import api_router
from app.core.database import engine, Base
from app.core.logging import logger
import traceback

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Seismic Risk Portfolio API...")
    Base.metadata.create_all(bind=engine)
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="Seismic Risk Portfolio API",
    description="Backend API for Seismic Risk Portfolio Management System",
    version="1.0.0",
    lifespan=lifespan
)

# ⚠️ DEBUG ONLY - remove before production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": type(exc).__name__,
            "detail": str(exc),
            "traceback": traceback.format_exc()
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "seismic-risk-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )