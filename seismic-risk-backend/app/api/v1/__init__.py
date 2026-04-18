from .endpoints.ai_endpoints import router as ai_router
from .endpoints.ai_analytics import router as ai_router

api_router.include_router(ai_router, prefix="/api/v1")
# Ajouter dans la liste des routeurs
api_router.include_router(ai_router, prefix="/api/v1")