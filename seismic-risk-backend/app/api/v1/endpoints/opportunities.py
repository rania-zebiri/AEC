from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


@router.get("/map")
def get_opportunity_map(
    max_zone_score: float = Query(1.0, description="Maximum zone score for safe zones"),
    max_exposure_dzd: float = Query(500_000_000, description="Maximum exposure to consider under-exploited"),
    db: Session = Depends(get_db)
):
    """
    Selling Opportunity Map
    Wilayas with low risk (zone_score <= threshold) and low concentration
    """
    
    results = db.query(
        Wilaya.id,
        Wilaya.code,
        Wilaya.name_fr,
        Wilaya.name_ar,
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        Wilaya.latitude,
        Wilaya.longitude,
        Wilaya.population_growth_pct,
        Wilaya.competition_level,
        Wilaya.region,
        func.coalesce(func.sum(Contract.capital_assure), 0).label("current_exposure_dzd"),
        func.count(Contract.id).label("contract_count")
    ).outerjoin(Contract, (Contract.wilaya_id == Wilaya.id) & (Contract.is_active == True))\
     .filter(Wilaya.zone_score <= max_zone_score)\
     .group_by(Wilaya.id)\
     .having(func.coalesce(func.sum(Contract.capital_assure), 0) < max_exposure_dzd)\
     .order_by(Wilaya.population_growth_pct.desc(), func.coalesce(func.sum(Contract.capital_assure), 0).asc())\
     .all()
    
    opportunities = []
    for row in results:
        # Calculate opportunity score (higher = better opportunity)
        growth_score = float(row.population_growth_pct) / 10.0  # Normalize
        competition_scores = {"LOW": 1.0, "MEDIUM": 0.5, "HIGH": 0.2}
        competition_score = competition_scores.get(row.competition_level, 0.5)
        exposure_score = 1 - (float(row.current_exposure_dzd) / max_exposure_dzd) if max_exposure_dzd > 0 else 1
        
        opportunity_score = (growth_score * 0.4 + competition_score * 0.3 + exposure_score * 0.3) * 100
        
        # Determine opportunity level
        if opportunity_score >= 70:
            opportunity_level = "HIGH"
            color = "#22c55e"
        elif opportunity_score >= 40:
            opportunity_level = "MEDIUM"
            color = "#eab308"
        else:
            opportunity_level = "LOW"
            color = "#6b7280"
        
        opportunities.append({
            "id": row.id,
            "code": row.code,
            "name_fr": row.name_fr,
            "name_ar": row.name_ar,
            "rpa_zone": row.rpa_zone,
            "zone_score": float(row.zone_score),
            "latitude": float(row.latitude) if row.latitude else None,
            "longitude": float(row.longitude) if row.longitude else None,
            "region": row.region,
            "population_growth_pct": float(row.population_growth_pct) if row.population_growth_pct else 0,
            "competition_level": row.competition_level,
            "current_exposure_dzd": float(row.current_exposure_dzd),
            "contract_count": row.contract_count,
            "opportunity_score": round(opportunity_score, 1),
            "opportunity_level": opportunity_level,
            "color": color,
            "available_capacity_dzd": max(0, max_exposure_dzd - float(row.current_exposure_dzd))
        })
    
    return opportunities


@router.get("/top-wilayas")
def get_top_opportunities(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Returns top N wilayas with highest opportunity score"""
    
    opportunities = get_opportunity_map(db=db)
    
    return sorted(opportunities, key=lambda x: x["opportunity_score"], reverse=True)[:limit]


@router.get("/by-sector/{sector}")
def get_opportunities_by_sector(
    sector: str,  # Nord, Hauts Plateau, Sud
    db: Session = Depends(get_db)
):
    """Returns opportunities filtered by geographic sector"""
    
    opportunities = get_opportunity_map(db=db)
    
    return [o for o in opportunities if o.get("region") == sector]