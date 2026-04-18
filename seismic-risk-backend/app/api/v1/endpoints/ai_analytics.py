# app/api/v1/endpoints/ai_analytics.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.ai_integration import AIIntegrationService
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Analytics"])


@router.get("/portfolio-analysis")
def get_portfolio_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyse complète du portefeuille avec IA"""
    
    portfolio_data = AIIntegrationService.get_portfolio_data(db)
    
    balance_index = AIIntegrationService.calculate_balance_index(portfolio_data)
    hotspots = AIIntegrationService.detect_hotspots(portfolio_data)
    
    return {
        "balance_index": balance_index,
        "hotspots": hotspots,
        "total_contracts": len(portfolio_data),
        "total_exposure_dzd": sum(c['capital'] for c in portfolio_data),
        "analysis_date": datetime.now().isoformat()
    }


@router.get("/pricing-advice/{wilaya_id}")
def get_pricing_advice(
    wilaya_id: int,
    current_premium: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Conseil de tarification pour une wilaya"""
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail="Wilaya not found")
    
    advice = AIIntegrationService.get_pricing_advice(
        wilaya.name_fr, 
        current_premium, 
        wilaya.rpa_zone
    )
    
    return advice


@router.post("/simulate-pml")
def simulate_pml(
    capital: float,
    structure_type: str,
    magnitude: float,
    retention_rate: float = 0.2,
    current_user: User = Depends(get_current_user)
):
    """Simule la perte maximale probable (PML)"""
    
    result = AIIntegrationService.calculate_pml(capital, structure_type, magnitude, retention_rate)
    
    return result


@router.get("/zone/{wilaya_name}")
def get_zone(
    wilaya_name: str,
    commune: str = None,
    current_user: User = Depends(get_current_user)
):
    """Retourne la zone RPA d'une wilaya"""
    
    zone = AIIntegrationService.get_zone_by_location(wilaya_name, commune)
    
    return {
        "wilaya": wilaya_name,
        "commune": commune,
        "rpa_zone": zone,
        "risk_level": AIIntegrationService.get_risk_level_description(zone) if hasattr(AIIntegrationService, 'get_risk_level_description') else ""
    }


@router.get("/vulnerability-factor")
def get_vulnerability(
    structure_type: str,
    current_user: User = Depends(get_current_user)
):
    """Retourne le facteur de vulnérabilité d'un type de bâtiment"""
    
    factor = AIIntegrationService.get_vulnerability_factor(structure_type)
    
    return {
        "structure_type": structure_type,
        "vulnerability_factor": factor,
        "label": "Très Résistant" if factor <= 0.2 else "Résistant" if factor <= 0.4 else "Modéré" if factor <= 0.6 else "Fragile"
    }