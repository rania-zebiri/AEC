from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.seismic_alert import SeismicAlert
from app.models.wilaya import Wilaya
from app.models.pml_simulation import PMLSimulation

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/recent")
def get_recent_alerts(
    hours: int = Query(24, ge=1, le=168),
    min_magnitude: float = Query(4.0, ge=0, le=10),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get recent seismic alerts"""
    
    cutoff_time = datetime.now() - timedelta(hours=hours)
    
    alerts = db.query(SeismicAlert).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.magnitude >= min_magnitude
    ).order_by(desc(SeismicAlert.event_datetime)).limit(limit).all()
    
    result = []
    for alert in alerts:
        wilaya = db.query(Wilaya).filter(Wilaya.id == alert.wilaya_id).first()
        
        result.append({
            "id": alert.id,
            "event_id_external": alert.event_id_external,
            "event_datetime": alert.event_datetime.isoformat(),
            "magnitude": float(alert.magnitude),
            "wilaya": wilaya.name_fr if wilaya else None,
            "epicenter_lat": float(alert.epicenter_lat) if alert.epicenter_lat else None,
            "epicenter_lng": float(alert.epicenter_lng) if alert.epicenter_lng else None,
            "depth_km": float(alert.depth_km) if alert.depth_km else None,
            "alert_sent": alert.alert_sent,
            "has_pml": alert.auto_pml_id is not None
        })
    
    return result


@router.get("/{alert_id}")
def get_alert_detail(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed alert information including PML simulation"""
    
    alert = db.query(SeismicAlert).filter(SeismicAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == alert.wilaya_id).first()
    
    result = {
        "id": alert.id,
        "event_id_external": alert.event_id_external,
        "event_datetime": alert.event_datetime.isoformat(),
        "magnitude": float(alert.magnitude),
        "wilaya": wilaya.name_fr if wilaya else None,
        "epicenter_lat": float(alert.epicenter_lat) if alert.epicenter_lat else None,
        "epicenter_lng": float(alert.epicenter_lng) if alert.epicenter_lng else None,
        "depth_km": float(alert.depth_km) if alert.depth_km else None,
        "alert_sent": alert.alert_sent,
        "alert_sent_at": alert.alert_sent_at.isoformat() if alert.alert_sent_at else None,
        "received_at": alert.received_at.isoformat() if alert.received_at else None
    }
    
    # Include PML simulation if available
    if alert.auto_pml_id:
        pml = db.query(PMLSimulation).filter(PMLSimulation.id == alert.auto_pml_id).first()
        if pml:
            result["pml_simulation"] = {
                "expected_loss_dzd": float(pml.expected_loss_dzd),
                "net_company_loss_dzd": float(pml.net_company_loss_dzd),
                "loss_ratio_pct": float(pml.loss_ratio_pct)
            }
    
    return result


@router.post("/simulate")
def simulate_seismic_event(
    magnitude: float,
    wilaya_id: int,
    event_datetime: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Simulate a seismic event (for testing)"""
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail=f"Wilaya {wilaya_id} not found")
    
    from app.services.pml_engine import PMLEngine
    pml_result = PMLEngine.calculate_pml(db, wilaya_id, magnitude, None, None)
    
    alert = SeismicAlert(
        event_id_external=f"SIM_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        event_datetime=event_datetime or datetime.now(),
        magnitude=magnitude,
        wilaya_id=wilaya_id,
        auto_pml_id=pml_result["simulation_id"],
        alert_sent=False
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    return {
        "alert_id": alert.id,
        "message": f"Seismic event simulated for {wilaya.name_fr}",
        "pml": {
            "expected_loss_dzd": pml_result["expected_loss_dzd"],
            "net_company_loss_dzd": pml_result["net_company_loss_dzd"]
        }
    }