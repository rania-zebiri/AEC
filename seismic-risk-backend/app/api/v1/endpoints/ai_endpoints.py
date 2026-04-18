# app/api/v1/endpoints/ai_endpoints.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services.ai_bridge import AIBridgeService
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Analytics"])


class ContractEvaluationRequest(BaseModel):
    wilaya: str
    commune: Optional[str] = None
    floors: int = 1
    height: float = 3
    capital: float = 1000000
    structure: str = "INCONNU"


@router.get("/portfolio-analysis")
def get_portfolio_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyse complète du portefeuille avec IA"""
    
    result = AIBridgeService.get_portfolio_analysis(db)
    return result


@router.post("/evaluate-contract")
def evaluate_contract(
    request: ContractEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Évalue un contrat avec les règles IA"""
    
    result = AIBridgeService.evaluate_contract(db, request.dict())
    return result


@router.get("/pricing/{wilaya_name}")
def get_pricing(
    wilaya_name: str,
    current_premium: float,
    current_user: User = Depends(get_current_user)
):
    """Stratégie de tarification IA"""
    
    result = AIBridgeService.get_pricing_strategy(wilaya_name, current_premium)
    return result


@router.get("/vulnerability/{structure_type}")
def get_vulnerability(
    structure_type: str,
    current_user: User = Depends(get_current_user)
):
    """Analyse de vulnérabilité"""
    
    result = AIBridgeService.get_vulnerability_analysis(structure_type)
    return result


@router.get("/zone/{wilaya_name}")
def get_zone(
    wilaya_name: str,
    commune: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Retourne la zone RPA d'une wilaya"""
    
    from seismic_risk_ai.core.rpa_zones import get_zone_by_location, get_risk_level_description
    
    zone = get_zone_by_location(wilaya_name, commune)
    description = get_risk_level_description(zone)
    
    return {
        "wilaya": wilaya_name,
        "commune": commune,
        "rpa_zone": zone,
        "risk_description": description
    }