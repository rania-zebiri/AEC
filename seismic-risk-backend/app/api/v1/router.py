
from fastapi import APIRouter
from app.api.v1.endpoints import (
    dashboard, map, top10, pml, underwriting,
    monthly_compare, opportunities, client_score,
    hotspots, segmentation, reports, alerts, auth
)

api_router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
api_router.include_router(auth.router)  # Add auth FIRST
api_router.include_router(dashboard.router)
api_router.include_router(map.router)
api_router.include_router(top10.router)
api_router.include_router(pml.router)
api_router.include_router(underwriting.router)
api_router.include_router(monthly_compare.router)
api_router.include_router(opportunities.router)
api_router.include_router(client_score.router)
api_router.include_router(hotspots.router)
api_router.include_router(segmentation.router)
api_router.include_router(reports.router)
api_router.include_router(alerts.router)

@api_router.get("/")
def root():
    return {
        "message": "Seismic Risk Portfolio API v1",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/v1/auth",
            "dashboard": "/api/v1/dashboard",
            "map": "/api/v1/map",
            "top10": "/api/v1/top10",
            "pml": "/api/v1/pml",
            "underwriting": "/api/v1/underwriting",
            "monthly_compare": "/api/v1/monthly-compare",
            "opportunities": "/api/v1/opportunities",
            "client_score": "/api/v1/client-score",
            "hotspots": "/api/v1/hotspots",
            "segmentation": "/api/v1/segmentation",
            "reports": "/api/v1/reports",
            "alerts": "/api/v1/alerts",
            "wilayas": "/api/v1/wilayas"
        }
    }
