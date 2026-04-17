from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from typing import List, Optional
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore

router = APIRouter(prefix="/top10", tags=["Top 10"])


@router.get("/risky-policies")
def get_top_10_risky_policies(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Returns top N policies sorted by capital × vulnerability × zone_score
    """
    
    # Raw SQL for complex calculation
    query = db.query(
        Contract.id,
        Contract.numero_police,
        Contract.code_sous_branche,
        Contract.capital_assure,
        Contract.prime_nette,
        Wilaya.name_fr.label("wilaya_name"),
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        BuildingType.code.label("building_type_code"),
        BuildingType.vulnerability_factor,
        BuildingType.risk_category,
        RiskScore.risk_score,
        RiskScore.risk_level,
        (Contract.capital_assure * BuildingType.vulnerability_factor * Wilaya.zone_score).label("risk_weight")
    ).join(Wilaya, Contract.wilaya_id == Wilaya.id)\
     .join(BuildingType, Contract.building_type_id == BuildingType.id)\
     .outerjoin(RiskScore, RiskScore.contract_id == Contract.id)\
     .filter(Contract.is_active == True)\
     .order_by(desc("risk_weight"))\
     .limit(limit)\
     .all()
    
    return [
        {
            "rank": idx + 1,
            "id": row.id,
            "numero_police": row.numero_police,
            "code_sous_branche": row.code_sous_branche,
            "capital_assure_dzd": float(row.capital_assure),
            "prime_nette_dzd": float(row.prime_nette),
            "wilaya": row.wilaya_name,
            "rpa_zone": row.rpa_zone,
            "zone_score": float(row.zone_score),
            "building_type": row.building_type_code,
            "vulnerability_factor": float(row.vulnerability_factor),
            "risk_score": float(row.risk_score) if row.risk_score else None,
            "risk_level": row.risk_level,
            "risk_weight": float(row.risk_weight) if row.risk_weight else 0
        }
        for idx, row in enumerate(query)
    ]


@router.get("/by-risk-score")
def get_top_10_by_risk_score(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Returns top N policies by computed risk score"""
    
    results = db.query(
        Contract.numero_police,
        Contract.capital_assure,
        Wilaya.name_fr.label("wilaya"),
        RiskScore.risk_score,
        RiskScore.risk_level,
        RiskScore.zone_score_component,
        RiskScore.vuln_component,
        RiskScore.capital_component
    ).join(RiskScore, RiskScore.contract_id == Contract.id)\
     .join(Wilaya, Contract.wilaya_id == Wilaya.id)\
     .filter(Contract.is_active == True)\
     .order_by(desc(RiskScore.risk_score))\
     .limit(limit)\
     .all()
    
    return [
        {
            "rank": idx + 1,
            "numero_police": row.numero_police,
            "capital_assure_dzd": float(row.capital_assure),
            "wilaya": row.wilaya,
            "risk_score": float(row.risk_score),
            "risk_level": row.risk_level,
            "components": {
                "zone": float(row.zone_score_component) if row.zone_score_component else 0,
                "vulnerability": float(row.vuln_component) if row.vuln_component else 0,
                "capital": float(row.capital_component) if row.capital_component else 0
            }
        }
        for idx, row in enumerate(results)
    ]


@router.get("/by-wilaya/{wilaya_id}")
def get_top_10_by_wilaya(
    wilaya_id: int,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Returns top N risky policies in a specific wilaya"""
    
    results = db.query(
        Contract.numero_police,
        Contract.capital_assure,
        BuildingType.code.label("building_type"),
        BuildingType.vulnerability_factor,
        RiskScore.risk_score,
        RiskScore.risk_level
    ).join(BuildingType, Contract.building_type_id == BuildingType.id)\
     .outerjoin(RiskScore, RiskScore.contract_id == Contract.id)\
     .filter(Contract.wilaya_id == wilaya_id, Contract.is_active == True)\
     .order_by(desc(RiskScore.risk_score))\
     .limit(limit)\
     .all()
    
    return [
        {
            "rank": idx + 1,
            "numero_police": row.numero_police,
            "capital_assure_dzd": float(row.capital_assure),
            "building_type": row.building_type,
            "vulnerability_factor": float(row.vulnerability_factor),
            "risk_score": float(row.risk_score) if row.risk_score else None,
            "risk_level": row.risk_level
        }
        for idx, row in enumerate(results)
    ]