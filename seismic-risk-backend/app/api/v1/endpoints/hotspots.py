from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
from app.core.database import get_db
from app.services.hotspot_detector import HotspotDetector

router = APIRouter(prefix="/hotspots", tags=["Hotspots"])


@router.get("/current")
def get_current_hotspots(db: Session = Depends(get_db)):
    """Returns current hotspots, warnings and safe wilayas"""
    
    try:
        result = HotspotDetector.get_current_hotspots(db)
        return result
    except Exception as e:
        return {
            "hotspots": [],
            "warnings": [],
            "safe_wilayas": [],
            "global_capacity": 1000000000,
            "stats": {"safe": 0, "warning": 0, "hotspot": 0},
            "error": str(e),
            "last_updated": date.today().isoformat()
        }


@router.get("/snapshot/{snapshot_date}")
def get_snapshot_hotspots(
    snapshot_date: date,
    db: Session = Depends(get_db)
):
    """Returns hotspots for a specific date"""
    
    try:
        from app.models.hotspot_snapshot import HotspotSnapshot
        from app.models.wilaya import Wilaya
        
        snapshots = db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date == snapshot_date,
            HotspotSnapshot.is_hotspot == True
        ).all()
        
        result = []
        for snapshot in snapshots:
            wilaya = db.query(Wilaya).filter(Wilaya.id == snapshot.wilaya_id).first()
            if wilaya:
                result.append({
                    "wilaya_id": snapshot.wilaya_id,
                    "wilaya_name": wilaya.name_fr,
                    "wilaya_code": wilaya.code,
                    "rpa_zone": wilaya.rpa_zone,
                    "total_capital_dzd": float(snapshot.total_capital_dzd),
                    "retention_capacity_dzd": float(snapshot.retention_capacity_dzd),
                    "excess_dzd": float(snapshot.excess_dzd),
                    "excess_pct": float(snapshot.excess_pct),
                    "contract_count": snapshot.contract_count
                })
        
        return result
    except Exception as e:
        return {"error": str(e), "hotspots": []}


@router.post("/snapshot")
def create_snapshot(
    snapshot_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Manually create a hotspot snapshot"""
    
    try:
        snapshots = HotspotDetector.create_snapshot(db, snapshot_date)
        return {
            "message": f"Created {len(snapshots)} snapshots",
            "snapshot_date": (snapshot_date or date.today()).isoformat(),
            "count": len(snapshots)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))