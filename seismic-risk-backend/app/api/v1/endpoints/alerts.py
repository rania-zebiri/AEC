from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.seismic_alert import SeismicAlert
from app.models.wilaya import Wilaya
from app.models.pml_simulation import PMLSimulation
from app.services.pml_engine import PMLEngine
from app.core.logging import log_audit, logger

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/recent")
def get_recent_alerts(
    hours: int = Query(24, ge=1, le=168, description="Hours to look back"),
    min_magnitude: float = Query(4.0, ge=0, le=10, description="Minimum magnitude"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of alerts"),
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
            "wilaya_id": alert.wilaya_id,
            "epicenter_lat": float(alert.epicenter_lat) if alert.epicenter_lat else None,
            "epicenter_lng": float(alert.epicenter_lng) if alert.epicenter_lng else None,
            "depth_km": float(alert.depth_km) if alert.depth_km else None,
            "alert_sent": alert.alert_sent,
            "alert_sent_at": alert.alert_sent_at.isoformat() if alert.alert_sent_at else None,
            "received_at": alert.received_at.isoformat() if alert.received_at else None,
            "has_pml": alert.auto_pml_id is not None
        })
    
    return result


@router.get("/active")
def get_active_alerts(
    min_magnitude: float = Query(4.0, ge=0, le=10),
    db: Session = Depends(get_db)
):
    """Get active alerts that haven't been acknowledged"""
    
    # Alerts from last 48 hours that haven't been sent or are significant
    cutoff_time = datetime.now() - timedelta(hours=48)
    
    alerts = db.query(SeismicAlert).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.magnitude >= min_magnitude,
        SeismicAlert.alert_sent == False
    ).order_by(desc(SeismicAlert.magnitude), desc(SeismicAlert.event_datetime)).all()
    
    result = []
    for alert in alerts:
        wilaya = db.query(Wilaya).filter(Wilaya.id == alert.wilaya_id).first()
        
        # Determine severity
        if alert.magnitude >= 6.5:
            severity = "CRITICAL"
            color = "red"
        elif alert.magnitude >= 5.5:
            severity = "HIGH"
            color = "orange"
        elif alert.magnitude >= 4.5:
            severity = "MEDIUM"
            color = "yellow"
        else:
            severity = "LOW"
            color = "green"
        
        result.append({
            "id": alert.id,
            "event_id_external": alert.event_id_external,
            "event_datetime": alert.event_datetime.isoformat(),
            "magnitude": float(alert.magnitude),
            "wilaya": wilaya.name_fr if wilaya else None,
            "depth_km": float(alert.depth_km) if alert.depth_km else None,
            "severity": severity,
            "color": color,
            "alert_sent": alert.alert_sent
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
        "wilaya": {
            "id": wilaya.id if wilaya else None,
            "name_fr": wilaya.name_fr if wilaya else None,
            "rpa_zone": wilaya.rpa_zone if wilaya else None,
            "zone_score": float(wilaya.zone_score) if wilaya else None
        } if wilaya else None,
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
                "id": pml.id,
                "expected_loss_dzd": float(pml.expected_loss_dzd),
                "net_company_loss_dzd": float(pml.net_company_loss_dzd),
                "loss_ratio_pct": float(pml.loss_ratio_pct),
                "reinsurance_cover_dzd": float(pml.reinsurance_cover_dzd),
                "contract_count": pml.contract_count,
                "simulated_at": pml.simulated_at.isoformat() if pml.simulated_at else None
            }
    
    return result


@router.get("/stats/summary")
def get_alert_statistics(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get alert statistics for the last N days"""
    
    cutoff_time = datetime.now() - timedelta(days=days)
    
    # Total alerts
    total_alerts = db.query(func.count(SeismicAlert.id)).filter(
        SeismicAlert.event_datetime >= cutoff_time
    ).scalar() or 0
    
    # Alerts by magnitude range
    critical_alerts = db.query(func.count(SeismicAlert.id)).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.magnitude >= 6.5
    ).scalar() or 0
    
    high_alerts = db.query(func.count(SeismicAlert.id)).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.magnitude >= 5.5,
        SeismicAlert.magnitude < 6.5
    ).scalar() or 0
    
    medium_alerts = db.query(func.count(SeismicAlert.id)).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.magnitude >= 4.5,
        SeismicAlert.magnitude < 5.5
    ).scalar() or 0
    
    low_alerts = db.query(func.count(SeismicAlert.id)).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.magnitude < 4.5
    ).scalar() or 0
    
    # Highest magnitude
    highest_magnitude = db.query(func.max(SeismicAlert.magnitude)).filter(
        SeismicAlert.event_datetime >= cutoff_time
    ).scalar() or 0
    
    # Most affected wilaya
    most_affected = db.query(
        SeismicAlert.wilaya_id,
        func.count(SeismicAlert.id).label("alert_count")
    ).filter(
        SeismicAlert.event_datetime >= cutoff_time,
        SeismicAlert.wilaya_id.isnot(None)
    ).group_by(SeismicAlert.wilaya_id).order_by(desc("alert_count")).first()
    
    most_affected_wilaya = None
    if most_affected:
        wilaya = db.query(Wilaya).filter(Wilaya.id == most_affected[0]).first()
        most_affected_wilaya = {
            "id": most_affected[0],
            "name_fr": wilaya.name_fr if wilaya else None,
            "alert_count": most_affected[1]
        }
    
    return {
        "period_days": days,
        "total_alerts": total_alerts,
        "by_severity": {
            "critical": critical_alerts,
            "high": high_alerts,
            "medium": medium_alerts,
            "low": low_alerts
        },
        "highest_magnitude": float(highest_magnitude),
        "most_affected_wilaya": most_affected_wilaya,
        "alerts_with_pml": db.query(func.count(SeismicAlert.id)).filter(
            SeismicAlert.event_datetime >= cutoff_time,
            SeismicAlert.auto_pml_id.isnot(None)
        ).scalar() or 0
    }


@router.post("/simulate")
def simulate_seismic_event(
    magnitude: float = Query(..., ge=4.0, le=8.5, description="Earthquake magnitude"),
    wilaya_id: int = Query(..., ge=1, le=58, description="Wilaya ID"),
    depth_km: float = Query(10.0, ge=0, le=100, description="Depth in kilometers"),
    latitude: Optional[float] = Query(None, ge=20, le=38, description="Epicenter latitude"),
    longitude: Optional[float] = Query(None, ge=-9, le=12, description="Epicenter longitude"),
    event_datetime: Optional[datetime] = None,
    calculate_pml: bool = Query(True, description="Calculate PML for this event"),
    db: Session = Depends(get_db)
):
    """Simulate a seismic event for testing purposes"""
    
    # Verify wilaya exists
    wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail=f"Wilaya {wilaya_id} not found")
    
    # Generate external event ID
    event_id = f"SIM_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
    
    # Create alert
    alert = SeismicAlert(
        event_id_external=event_id,
        event_datetime=event_datetime or datetime.now(),
        magnitude=magnitude,
        wilaya_id=wilaya_id,
        epicenter_lat=latitude,
        epicenter_lng=longitude,
        depth_km=depth_km,
        alert_sent=False,
        received_at=datetime.now()
    )
    
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    # Calculate PML if requested
    pml_result = None
    if calculate_pml:
        pml_result = PMLEngine.calculate_pml(
            db=db,
            wilaya_id=wilaya_id,
            magnitude=magnitude,
            scenario_month=None,
            user_id=None
        )
        
        # Link PML to alert
        alert.auto_pml_id = pml_result["simulation_id"]
        db.commit()
    
    # Log audit
    log_audit(
        db=db,
        user_id=None,
        action="ALERT_SIMULATE",
        entity_type="seismic_alerts",
        entity_id=alert.id,
        details={
            "magnitude": magnitude,
            "wilaya": wilaya.name_fr,
            "simulated": True
        }
    )
    
    response = {
        "alert_id": alert.id,
        "event_id": event_id,
        "message": f"Seismic event of magnitude {magnitude} simulated for {wilaya.name_fr}",
        "alert": {
            "id": alert.id,
            "magnitude": magnitude,
            "wilaya": wilaya.name_fr,
            "event_datetime": alert.event_datetime.isoformat(),
            "depth_km": depth_km
        }
    }
    
    if pml_result:
        response["pml"] = {
            "simulation_id": pml_result["simulation_id"],
            "expected_loss_dzd": pml_result["expected_loss_dzd"],
            "net_company_loss_dzd": pml_result["net_company_loss_dzd"],
            "loss_ratio_pct": pml_result["loss_ratio_pct"]
        }
    
    return response


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """Acknowledge an alert (mark as processed)"""
    
    alert = db.query(SeismicAlert).filter(SeismicAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    
    # Mark as acknowledged (you might want to add an acknowledged_at field)
    # For now, we just return success
    alert.alert_sent = True
    alert.alert_sent_at = datetime.now()
    db.commit()
    
    return {
        "message": f"Alert {alert_id} acknowledged successfully",
        "alert_id": alert_id,
        "acknowledged_at": alert.alert_sent_at.isoformat()
    }


@router.post("/webhook/craag")
def craag_webhook(
    data: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for real seismic data from CRAAG or other monitoring services
    """
    
    # Expected fields from CRAAG
    # {
    #   "event_id": "CRAAG-20240315-001",
    #   "timestamp": "2024-03-15T03:00:00Z",
    #   "magnitude": 5.2,
    #   "latitude": 36.1234,
    #   "longitude": 1.9876,
    #   "depth": 10.0,
    #   "location": "Blida"
    # }
    
    try:
        event_id = data.get("event_id")
        if not event_id:
            raise HTTPException(status_code=400, detail="Missing event_id")
        
        # Check if already processed
        existing = db.query(SeismicAlert).filter(
            SeismicAlert.event_id_external == event_id
        ).first()
        
        if existing:
            return {"message": "Event already processed", "alert_id": existing.id}
        
        # Find nearest wilaya based on coordinates or location name
        wilaya_id = None
        location = data.get("location")
        
        if location:
            wilaya = db.query(Wilaya).filter(
                Wilaya.name_fr.ilike(f"%{location}%")
            ).first()
            if wilaya:
                wilaya_id = wilaya.id
        
        # Create alert
        alert = SeismicAlert(
            event_id_external=event_id,
            event_datetime=datetime.fromisoformat(data.get("timestamp", "").replace("Z", "+00:00")),
            magnitude=data.get("magnitude"),
            wilaya_id=wilaya_id,
            epicenter_lat=data.get("latitude"),
            epicenter_lng=data.get("longitude"),
            depth_km=data.get("depth"),
            alert_sent=False,
            received_at=datetime.now()
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        # Calculate PML in background if significant
        if alert.magnitude >= 5.0 and wilaya_id:
            background_tasks.add_task(
                calculate_pml_for_alert,
                db,
                alert.id,
                wilaya_id,
                alert.magnitude
            )
        
        return {
            "message": "Alert received",
            "alert_id": alert.id,
            "pml_calculation_scheduled": alert.magnitude >= 5.0
        }
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/wilaya/{wilaya_id}/history")
def get_wilaya_alert_history(
    wilaya_id: int,
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get alert history for a specific wilaya"""
    
    cutoff_time = datetime.now() - timedelta(days=days)
    
    alerts = db.query(SeismicAlert).filter(
        SeismicAlert.wilaya_id == wilaya_id,
        SeismicAlert.event_datetime >= cutoff_time
    ).order_by(desc(SeismicAlert.event_datetime)).all()
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
    
    return {
        "wilaya": {
            "id": wilaya_id,
            "name_fr": wilaya.name_fr if wilaya else None
        },
        "period_days": days,
        "total_alerts": len(alerts),
        "alerts": [
            {
                "id": a.id,
                "event_datetime": a.event_datetime.isoformat(),
                "magnitude": float(a.magnitude),
                "depth_km": float(a.depth_km) if a.depth_km else None,
                "has_pml": a.auto_pml_id is not None
            }
            for a in alerts
        ]
    }


def calculate_pml_for_alert(db: Session, alert_id: int, wilaya_id: int, magnitude: float):
    """Background task to calculate PML for an alert"""
    try:
        pml_result = PMLEngine.calculate_pml(
            db=db,
            wilaya_id=wilaya_id,
            magnitude=magnitude,
            scenario_month=None,
            user_id=None
        )
        
        # Link PML to alert
        alert = db.query(SeismicAlert).filter(SeismicAlert.id == alert_id).first()
        if alert:
            alert.auto_pml_id = pml_result["simulation_id"]
            db.commit()
            logger.info(f"PML calculated for alert {alert_id}")
            
    except Exception as e:
        logger.error(f"Failed to calculate PML for alert {alert_id}: {e}")