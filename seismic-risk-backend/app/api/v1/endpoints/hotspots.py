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
    
    today = date.today()
    
    hotspots = db.query(HotspotSnapshot).filter(
        HotspotSnapshot.snapshot_date == today,
        HotspotSnapshot.is_hotspot == True
    ).all()
    
    # If no snapshot for today, calculate on the fly
    if not hotspots:
        from scripts.run_scheduler import SchedulerJobs
        scheduler = SchedulerJobs(db)
        scheduler.create_hotspot_snapshots()
        hotspots = db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date == today,
            HotspotSnapshot.is_hotspot == True
        ).all()
    
    result = []
    for hotspot in hotspots:
        wilaya = db.query(Wilaya).filter(Wilaya.id == hotspot.wilaya_id).first()
        if wilaya:
            result.append({
                "wilaya_id": hotspot.wilaya_id,
                "wilaya_name": wilaya.name_fr,
                "wilaya_code": wilaya.code,
                "rpa_zone": wilaya.rpa_zone,
                "zone_score": float(wilaya.zone_score),
                "total_capital_dzd": float(hotspot.total_capital_dzd),
                "retention_capacity_dzd": float(hotspot.retention_capacity_dzd),
                "excess_dzd": float(hotspot.excess_dzd),
                "excess_pct": float(hotspot.excess_pct),
                "contract_count": hotspot.contract_count,
                "pml_mag65_dzd": float(hotspot.pml_mag65_dzd) if hotspot.pml_mag65_dzd else 0,
                "risk_level": "CRITICAL" if hotspot.excess_pct > 200 else "HIGH" if hotspot.excess_pct > 100 else "MEDIUM"
            })
    
    return sorted(result, key=lambda x: x["excess_pct"], reverse=True)


@router.get("/history")
def get_hotspot_history(
    wilaya_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Returns hotspot history"""
    
    start_date = date.today() - timedelta(days=days)
    
    query = db.query(HotspotSnapshot).filter(
        HotspotSnapshot.snapshot_date >= start_date
    )
    
    if wilaya_id:
        query = query.filter(HotspotSnapshot.wilaya_id == wilaya_id)
    
    snapshots = query.order_by(HotspotSnapshot.snapshot_date).all()
    
    result = []
    for snapshot in snapshots:
        wilaya = db.query(Wilaya).filter(Wilaya.id == snapshot.wilaya_id).first()
        result.append({
            "date": snapshot.snapshot_date.isoformat(),
            "wilaya_id": snapshot.wilaya_id,
            "wilaya_name": wilaya.name_fr if wilaya else None,
            "total_capital_dzd": float(snapshot.total_capital_dzd),
            "is_hotspot": snapshot.is_hotspot,
            "excess_dzd": float(snapshot.excess_dzd),
            "excess_pct": float(snapshot.excess_pct)
        })
    
    return result


@router.get("/thresholds")
def get_retention_thresholds(db: Session = Depends(get_db)):
    """Returns retention capacity configuration"""
    
    configs = db.query(RetentionConfig).filter(
        RetentionConfig.config_key.in_([
            "GLOBAL_RETENTION_CAPACITY",
            "REINSURANCE_COVERAGE_RATIO"
        ]),
        RetentionConfig.effective_from <= date.today()
    ).order_by(RetentionConfig.effective_from.desc()).all()
    
    result = {}
    for config in configs:
        result[config.config_key] = {
            "value": float(config.config_value),
            "unit": config.unit,
            "description": config.description,
            "effective_from": config.effective_from.isoformat()
        }
    
    return result