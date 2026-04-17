from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore

router = APIRouter(prefix="/segmentation", tags=["Segmentation"])


@router.get("/filter")
def filter_contracts(
    wilaya_ids: Optional[List[int]] = Query(None),
    zone_scores: Optional[List[float]] = Query(None),
    building_type_ids: Optional[List[int]] = Query(None),
    code_sous_branche: Optional[str] = None,
    min_capital: Optional[float] = None,
    max_capital: Optional[float] = None,
    min_risk_score: Optional[float] = None,
    max_risk_score: Optional[float] = None,
    risk_levels: Optional[List[str]] = Query(None),
    is_active: bool = True,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Filter contracts by multiple criteria"""
    
    query = db.query(
        Contract.id,
        Contract.numero_police,
        Contract.code_sous_branche,
        Contract.capital_assure,
        Contract.prime_nette,
        Contract.date_effect,
        Contract.date_expiration,
        Contract.commune,
        Contract.is_active,
        Wilaya.name_fr.label("wilaya_name"),
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        BuildingType.code.label("building_type_code"),
        BuildingType.label_fr.label("building_type_label"),
        BuildingType.vulnerability_factor,
        RiskScore.risk_score,
        RiskScore.risk_level
    ).join(Wilaya, Contract.wilaya_id == Wilaya.id)\
     .join(BuildingType, Contract.building_type_id == BuildingType.id)\
     .outerjoin(RiskScore, RiskScore.contract_id == Contract.id)
    
    # Apply filters
    if is_active is not None:
        query = query.filter(Contract.is_active == is_active)
    
    if wilaya_ids:
        query = query.filter(Contract.wilaya_id.in_(wilaya_ids))
    
    if zone_scores:
        query = query.filter(Wilaya.zone_score.in_(zone_scores))
    
    if building_type_ids:
        query = query.filter(Contract.building_type_id.in_(building_type_ids))
    
    if code_sous_branche:
        query = query.filter(Contract.code_sous_branche == code_sous_branche)
    
    if min_capital:
        query = query.filter(Contract.capital_assure >= min_capital)
    
    if max_capital:
        query = query.filter(Contract.capital_assure <= max_capital)
    
    if min_risk_score:
        query = query.filter(RiskScore.risk_score >= min_risk_score)
    
    if max_risk_score:
        query = query.filter(RiskScore.risk_score <= max_risk_score)
    
    if risk_levels:
        query = query.filter(RiskScore.risk_level.in_(risk_levels))
    
    total = query.count()
    results = query.offset(offset).limit(limit).all()
    
    return {
        "contracts": [
            {
                "id": row.id,
                "numero_police": row.numero_police,
                "code_sous_branche": row.code_sous_branche,
                "capital_assure_dzd": float(row.capital_assure),
                "prime_nette_dzd": float(row.prime_nette),
                "date_effect": row.date_effect.isoformat(),
                "date_expiration": row.date_expiration.isoformat(),
                "commune": row.commune,
                "is_active": row.is_active,
                "wilaya": row.wilaya_name,
                "rpa_zone": row.rpa_zone,
                "zone_score": float(row.zone_score),
                "building_type": row.building_type_code,
                "vulnerability_factor": float(row.vulnerability_factor),
                "risk_score": float(row.risk_score) if row.risk_score else None,
                "risk_level": row.risk_level
            }
            for row in results
        ],
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    }


@router.get("/by-zone/{zone}")
def get_contracts_by_zone(
    zone: str,  # Zone 0, I, IIa, IIb, III
    db: Session = Depends(get_db)
):
    """Returns contracts in a specific RPA zone"""
    
    results = db.query(
        Contract.numero_police,
        Contract.capital_assure,
        Wilaya.name_fr.label("wilaya"),
        Wilaya.rpa_zone,
        BuildingType.code.label("building_type"),
        RiskScore.risk_score
    ).join(Wilaya, Contract.wilaya_id == Wilaya.id)\
     .join(BuildingType, Contract.building_type_id == BuildingType.id)\
     .outerjoin(RiskScore, RiskScore.contract_id == Contract.id)\
     .filter(Wilaya.rpa_zone == zone, Contract.is_active == True)\
     .all()
    
    total_capital = sum(float(r.capital_assure) for r in results)
    
    return {
        "zone": zone,
        "contract_count": len(results),
        "total_capital_dzd": total_capital,
        "contracts": [
            {
                "numero_police": r.numero_police,
                "capital_assure_dzd": float(r.capital_assure),
                "wilaya": r.wilaya,
                "building_type": r.building_type,
                "risk_score": float(r.risk_score) if r.risk_score else None
            }
            for r in results[:100]  # Limit to 100 for response size
        ]
    }


@router.get("/statistics")
def get_segmentation_statistics(db: Session = Depends(get_db)):
    """Returns segmentation statistics"""
    
    # By RPA zone
    zone_stats = db.query(
        Wilaya.rpa_zone,
        func.sum(Contract.capital_assure).label("total_capital"),
        func.count(Contract.id).label("contract_count"),
        func.avg(RiskScore.risk_score).label("avg_risk_score")
    ).join(Contract, Contract.wilaya_id == Wilaya.id)\
     .outerjoin(RiskScore, RiskScore.contract_id == Contract.id)\
     .filter(Contract.is_active == True)\
     .group_by(Wilaya.rpa_zone)\
     .all()
    
    # By building type
    building_stats = db.query(
        BuildingType.code,
        BuildingType.risk_category,
        func.sum(Contract.capital_assure).label("total_capital"),
        func.count(Contract.id).label("contract_count"),
        func.avg(RiskScore.risk_score).label("avg_risk_score")
    ).join(Contract, Contract.building_type_id == BuildingType.id)\
     .outerjoin(RiskScore, RiskScore.contract_id == Contract.id)\
     .filter(Contract.is_active == True)\
     .group_by(BuildingType.code, BuildingType.risk_category)\
     .all()
    
    # By code sous branche
    branch_stats = db.query(
        Contract.code_sous_branche,
        func.sum(Contract.capital_assure).label("total_capital"),
        func.count(Contract.id).label("contract_count")
    ).filter(Contract.is_active == True)\
     .group_by(Contract.code_sous_branche)\
     .all()
    
    return {
        "by_rpa_zone": [
            {
                "zone": s.rpa_zone,
                "total_capital_dzd": float(s.total_capital),
                "contract_count": s.contract_count,
                "avg_risk_score": round(float(s.avg_risk_score), 1) if s.avg_risk_score else 0
            }
            for s in zone_stats
        ],
        "by_building_type": [
            {
                "code": s.code,
                "risk_category": s.risk_category,
                "total_capital_dzd": float(s.total_capital),
                "contract_count": s.contract_count,
                "avg_risk_score": round(float(s.avg_risk_score), 1) if s.avg_risk_score else 0
            }
            for s in building_stats
        ],
        "by_branch": [
            {
                "code": s.code_sous_branche,
                "total_capital_dzd": float(s.total_capital),
                "contract_count": s.contract_count
            }
            for s in branch_stats
        ]
    }