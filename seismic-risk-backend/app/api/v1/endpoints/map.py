from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.risk_score import RiskScore
from app.models.hotspot_snapshot import HotspotSnapshot
from datetime import date

router = APIRouter(prefix="/map", tags=["Map"])


@router.get("/risk")
def get_map_risk_data(db: Session = Depends(get_db)):
    """Returns each wilaya with total capital, RPA zone, color, contract count"""
    
    results = db.query(
        Wilaya.id,
        Wilaya.code,
        Wilaya.name_fr,
        Wilaya.name_ar,
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        Wilaya.latitude,
        Wilaya.longitude,
        Wilaya.region,
        func.coalesce(func.sum(Contract.capital_assure), 0).label("total_capital"),
        func.count(Contract.id).label("contract_count")
    ).outerjoin(Contract, (Contract.wilaya_id == Wilaya.id) & (Contract.is_active == True))\
     .group_by(Wilaya.id)\
     .all()
    
    # Get today's hotspot data
    today = date.today()
    hotspots = db.query(HotspotSnapshot).filter(
        HotspotSnapshot.snapshot_date == today
    ).all()
    hotspot_dict = {h.wilaya_id: h for h in hotspots}
    
    def get_color(total_capital: float, zone_score: float) -> str:
        """Determine color based on capital and zone"""
        if total_capital >= 2_000_000_000:  # >= 2B DZD
            return "red"
        elif total_capital >= 1_000_000_000:  # >= 1B DZD
            return "orange"
        elif total_capital >= 500_000_000:  # >= 500M DZD
            return "yellow"
        else:
            return "green"
    
    map_data = []
    for row in results:
        hotspot = hotspot_dict.get(row.id)
        map_data.append({
            "id": row.id,
            "code": row.code,
            "name_fr": row.name_fr,
            "name_ar": row.name_ar,
            "rpa_zone": row.rpa_zone,
            "zone_score": float(row.zone_score),
            "color": get_color(float(row.total_capital), float(row.zone_score)),
            "latitude": float(row.latitude) if row.latitude else None,
            "longitude": float(row.longitude) if row.longitude else None,
            "region": row.region,
            "total_capital_dzd": float(row.total_capital),
            "contract_count": row.contract_count,
            "is_hotspot": hotspot.is_hotspot if hotspot else False,
            "excess_dzd": float(hotspot.excess_dzd) if hotspot else 0
        })
    
    return map_data


@router.get("/wilaya/{wilaya_id}/contracts")
def get_wilaya_contracts(
    wilaya_id: int,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Returns list of contracts for a specific wilaya"""
    
    # Verify wilaya exists
    wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail=f"Wilaya {wilaya_id} not found")
    
    contracts = db.query(Contract).filter(
        Contract.wilaya_id == wilaya_id,
        Contract.is_active == True
    ).offset(offset).limit(limit).all()
    
    total = db.query(func.count(Contract.id)).filter(
        Contract.wilaya_id == wilaya_id,
        Contract.is_active == True
    ).scalar() or 0
    
    result = []
    for contract in contracts:
        risk_score = db.query(RiskScore).filter(
            RiskScore.contract_id == contract.id
        ).first()
        
        result.append({
            "id": contract.id,
            "numero_police": contract.numero_police,
            "code_sous_branche": contract.code_sous_branche,
            "capital_assure_dzd": float(contract.capital_assure),
            "prime_nette_dzd": float(contract.prime_nette),
            "date_effect": contract.date_effect.isoformat(),
            "date_expiration": contract.date_expiration.isoformat(),
            "commune": contract.commune,
            "risk_score": float(risk_score.risk_score) if risk_score else None,
            "risk_level": risk_score.risk_level if risk_score else None
        })
    
    return {
        "wilaya": {
            "id": wilaya.id,
            "name_fr": wilaya.name_fr,
            "rpa_zone": wilaya.rpa_zone,
            "zone_score": float(wilaya.zone_score)
        },
        "contracts": result,
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    }


@router.get("/hotspots")
def get_hotspots(
    date_filter: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Returns wilayas that are hotspots (exceed retention capacity)"""
    
    snapshot_date = date_filter or date.today()
    
    hotspots = db.query(HotspotSnapshot).filter(
        HotspotSnapshot.snapshot_date == snapshot_date,
        HotspotSnapshot.is_hotspot == True
    ).all()
    
    result = []
    for hotspot in hotspots:
        wilaya = db.query(Wilaya).filter(Wilaya.id == hotspot.wilaya_id).first()
        if wilaya:
            result.append({
                "wilaya_id": hotspot.wilaya_id,
                "wilaya_name": wilaya.name_fr,
                "rpa_zone": wilaya.rpa_zone,
                "total_capital_dzd": float(hotspot.total_capital_dzd),
                "retention_capacity_dzd": float(hotspot.retention_capacity_dzd),
                "excess_dzd": float(hotspot.excess_dzd),
                "excess_pct": float(hotspot.excess_pct),
                "contract_count": hotspot.contract_count,
                "pml_mag65_dzd": float(hotspot.pml_mag65_dzd) if hotspot.pml_mag65_dzd else 0
            })
    
    return result