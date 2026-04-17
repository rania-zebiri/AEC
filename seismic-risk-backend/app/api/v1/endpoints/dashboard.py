from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, date
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.risk_score import RiskScore
from app.models.portfolio_monthly_stats import PortfolioMonthlyStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Returns capital grouped by wilaya × CODE_SOUS_BRANCHE"""
    
    results = db.query(
        Wilaya.id,
        Wilaya.name_fr,
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        Contract.code_sous_branche,
        func.sum(Contract.capital_assure).label("total_capital"),
        func.count(Contract.id).label("contract_count"),
        func.sum(Contract.prime_nette).label("total_premium")
    ).join(Contract, Contract.wilaya_id == Wilaya.id)\
     .filter(Contract.is_active == True)\
     .group_by(Wilaya.id, Wilaya.name_fr, Wilaya.rpa_zone, Wilaya.zone_score, Contract.code_sous_branche)\
     .all()
    
    # Format response
    summary = {}
    for row in results:
        if row.name_fr not in summary:
            summary[row.name_fr] = {
                "wilaya": row.name_fr,
                "wilaya_id": row.id,
                "rpa_zone": row.rpa_zone,
                "zone_score": float(row.zone_score),
                "categories": {}
            }
        summary[row.name_fr]["categories"][row.code_sous_branche] = {
            "total_capital_dzd": float(row.total_capital),
            "contract_count": row.contract_count,
            "total_premium_dzd": float(row.total_premium)
        }
    
    # Calculate totals
    total_capital = db.query(func.sum(Contract.capital_assure))\
                      .filter(Contract.is_active == True).scalar() or 0
    total_premium = db.query(func.sum(Contract.prime_nette))\
                      .filter(Contract.is_active == True).scalar() or 0
    total_contracts = db.query(func.count(Contract.id))\
                        .filter(Contract.is_active == True).scalar() or 0
    
    return {
        "grouped_data": list(summary.values()),
        "totals": {
            "total_capital_dzd": float(total_capital),
            "total_premium_dzd": float(total_premium),
            "total_contracts": total_contracts
        }
    }


@router.get("/kpi-cards")
def get_kpi_cards(db: Session = Depends(get_db)):
    """Returns KPI cards data"""
    
    # Total active exposure
    total_exposure = db.query(func.sum(Contract.capital_assure))\
                       .filter(Contract.is_active == True).scalar() or 0
    
    # Total premium
    total_premium = db.query(func.sum(Contract.prime_nette))\
                      .filter(Contract.is_active == True).scalar() or 0
    
    # Active contracts count
    active_contracts = db.query(func.count(Contract.id))\
                         .filter(Contract.is_active == True).scalar() or 0
    
    # Average risk score
    avg_risk_score = db.query(func.avg(RiskScore.risk_score))\
                       .join(Contract, RiskScore.contract_id == Contract.id)\
                       .filter(Contract.is_active == True).scalar() or 0
    
    # Hotspot count
    from app.models.hotspot_snapshot import HotspotSnapshot
    today = date.today()
    hotspot_count = db.query(func.count(HotspotSnapshot.id)).filter(
        HotspotSnapshot.snapshot_date == today,
        HotspotSnapshot.is_hotspot == True
    ).scalar() or 0
    
    # PML for magnitude 6.5
    from app.services.pml_engine import PMLEngine
    total_pml = 0
    wilayas = db.query(Wilaya).all()
    for wilaya in wilayas:
        pml_result = PMLEngine.calculate_pml(db, wilaya.id, 6.5, None, None)
        total_pml += pml_result.get("expected_loss_dzd", 0)
    
    return {
        "total_exposure_dzd": float(total_exposure),
        "total_premium_dzd": float(total_premium),
        "active_contracts": active_contracts,
        "avg_risk_score": round(float(avg_risk_score), 1),
        "hotspot_count": hotspot_count,
        "pml_mag65_dzd": float(total_pml)
    }


@router.get("/exposure-timeline")
def get_exposure_timeline(
    months: int = Query(12, ge=1, le=36),
    db: Session = Depends(get_db)
):
    """Returns exposure timeline for chart"""
    
    stats = db.query(PortfolioMonthlyStats).order_by(
        PortfolioMonthlyStats.month_date.desc()
    ).limit(months).all()
    
    stats.reverse()  # Oldest first
    
    return {
        "labels": [s.month_date.strftime("%b %Y") for s in stats],
        "exposure": [float(s.total_exposure_dzd) for s in stats],
        "premium": [float(s.total_premium_dzd) for s in stats],
        "pml": [float(s.pml_mag65_dzd) if s.pml_mag65_dzd else 0 for s in stats],
        "balance_index": [float(s.balance_index) if s.balance_index else 0 for s in stats]
    }