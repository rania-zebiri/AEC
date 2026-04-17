from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import date, timedelta
from app.core.database import get_db
from app.models.hotspot_snapshot import HotspotSnapshot
from app.models.wilaya import Wilaya
from app.models.contract import Contract
from app.models.retention_config import RetentionConfig

router = APIRouter(prefix="/hotspots", tags=["Hotspots"])


@router.get("/current")
def get_current_hotspots(db: Session = Depends(get_db)):
    """Returns current hotspots"""
    
    try:
        # Get retention capacity
        config = db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "GLOBAL_RETENTION_CAPACITY"
        ).order_by(RetentionConfig.effective_from.desc()).first()
        retention_capacity = float(config.config_value) if config else 1_000_000_000
        
        # Get current exposure per wilaya
        results = db.query(
            Wilaya.id,
            Wilaya.name_fr,
            Wilaya.code,
            Wilaya.rpa_zone,
            Wilaya.zone_score,
            func.coalesce(func.sum(Contract.capital_assure), 0).label("total_capital"),
            func.count(Contract.id).label("contract_count")
        ).outerjoin(Contract, (Contract.wilaya_id == Wilaya.id) & (Contract.is_active == True))\
         .group_by(Wilaya.id)\
         .having(func.coalesce(func.sum(Contract.capital_assure), 0) > retention_capacity)\
         .order_by(func.coalesce(func.sum(Contract.capital_assure), 0).desc())\
         .all()
        
        hotspots = []
        for row in results:
            excess_dzd = float(row.total_capital) - retention_capacity
            excess_pct = (excess_dzd / retention_capacity * 100) if retention_capacity > 0 else 0
            
            hotspots.append({
                "wilaya_id": row.id,
                "wilaya_name": row.name_fr,
                "wilaya_code": row.code,
                "rpa_zone": row.rpa_zone,
                "zone_score": float(row.zone_score),
                "total_capital_dzd": float(row.total_capital),
                "retention_capacity_dzd": retention_capacity,
                "excess_dzd": excess_dzd,
                "excess_pct": round(excess_pct, 2),
                "contract_count": row.contract_count,
                "risk_level": "CRITICAL" if excess_pct > 200 else "HIGH" if excess_pct > 100 else "MEDIUM"
            })
        
        return hotspots
        
    except Exception as e:
        return {"error": str(e), "hotspots": []}
