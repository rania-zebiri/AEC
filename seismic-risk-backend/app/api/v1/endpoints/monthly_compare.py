from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Optional
from datetime import date, timedelta
from app.core.database import get_db
from app.models.portfolio_monthly_stats import PortfolioMonthlyStats
from app.models.hotspot_snapshot import HotspotSnapshot

router = APIRouter(prefix="/monthly-compare", tags=["Monthly Compare"])


@router.get("/compare")
def get_monthly_comparison(
    current_month: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Returns this month vs last month KPIs
    """
    
    if current_month is None:
        # Get the latest month available
        latest = db.query(PortfolioMonthlyStats).order_by(
            desc(PortfolioMonthlyStats.month_date)
        ).first()
        if latest:
            current_month = latest.month_date
        else:
            return {"message": "No monthly stats available", "current_month": None, "previous_month": None}
    
    # Get current month stats
    current = db.query(PortfolioMonthlyStats).filter(
        PortfolioMonthlyStats.month_date == current_month
    ).first()
    
    # Get previous month (same month previous year, or just previous month)
    prev_month_date = date(current_month.year - 1, current_month.month, 1) if current_month.month == 1 else date(current_month.year, current_month.month - 1, 1)
    previous = db.query(PortfolioMonthlyStats).filter(
        PortfolioMonthlyStats.month_date == prev_month_date
    ).first()
    
    def format_stat(stat):
        if not stat:
            return None
        return {
            "month_date": stat.month_date.isoformat(),
            "total_exposure_dzd": float(stat.total_exposure_dzd),
            "total_premium_dzd": float(stat.total_premium_dzd),
            "active_contract_count": stat.active_contract_count,
            "hotspot_count": stat.hotspot_count,
            "zone3_exposure_dzd": float(stat.zone3_exposure_dzd) if stat.zone3_exposure_dzd else 0,
            "zone3_exposure_pct": float(stat.zone3_exposure_pct) if stat.zone3_exposure_pct else 0,
            "pml_mag65_dzd": float(stat.pml_mag65_dzd) if stat.pml_mag65_dzd else 0,
            "pml_mag65_pct_of_exposure": float(stat.pml_mag65_pct_of_exposure) if stat.pml_mag65_pct_of_exposure else 0,
            "balance_index": float(stat.balance_index) if stat.balance_index else 0,
            "new_contracts_count": stat.new_contracts_count,
            "cancelled_contracts_count": stat.cancelled_contracts_count,
            "avg_risk_score": float(stat.avg_risk_score) if stat.avg_risk_score else 0,
            "max_risk_score": float(stat.max_risk_score) if stat.max_risk_score else 0
        }
    
    current_data = format_stat(current)
    previous_data = format_stat(previous)
    
    # Calculate changes
    changes = None
    if current_data and previous_data:
        changes = {
            "exposure_change_pct": round(
                ((current_data["total_exposure_dzd"] - previous_data["total_exposure_dzd"]) / previous_data["total_exposure_dzd"] * 100) 
                if previous_data["total_exposure_dzd"] > 0 else 0, 2
            ),
            "premium_change_pct": round(
                ((current_data["total_premium_dzd"] - previous_data["total_premium_dzd"]) / previous_data["total_premium_dzd"] * 100)
                if previous_data["total_premium_dzd"] > 0 else 0, 2
            ),
            "pml_change_pct": round(
                ((current_data["pml_mag65_dzd"] - previous_data["pml_mag65_dzd"]) / previous_data["pml_mag65_dzd"] * 100)
                if previous_data["pml_mag65_dzd"] > 0 else 0, 2
            ),
            "balance_index_change": round(current_data["balance_index"] - previous_data["balance_index"], 1),
            "hotspot_count_change": current_data["hotspot_count"] - previous_data["hotspot_count"],
            "avg_risk_score_change": round(current_data["avg_risk_score"] - previous_data["avg_risk_score"], 1)
        }
    
    return {
        "current_month": current_data,
        "previous_month": previous_data,
        "changes": changes
    }


@router.get("/chart-data")
def get_monthly_chart_data(
    months: int = Query(12, ge=1, le=36),
    db: Session = Depends(get_db)
):
    """
    Returns monthly data for bar charts
    """
    
    stats = db.query(PortfolioMonthlyStats).order_by(
        PortfolioMonthlyStats.month_date
    ).limit(months).all()
    
    return {
        "labels": [s.month_date.strftime("%b %Y") for s in stats],
        "exposure": [float(s.total_exposure_dzd) for s in stats],
        "premium": [float(s.total_premium_dzd) for s in stats],
        "pml": [float(s.pml_mag65_dzd) if s.pml_mag65_dzd else 0 for s in stats],
        "balance_index": [float(s.balance_index) if s.balance_index else 0 for s in stats],
        "hotspot_count": [s.hotspot_count for s in stats],
        "active_contracts": [s.active_contract_count for s in stats]
    }


@router.get("/hotspot-evolution")
def get_hotspot_evolution(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db)
):
    """
    Returns hotspot evolution over time
    """
    
    # Get last N months of hotspot snapshots
    today = date.today()
    start_date = date(today.year, today.month, 1)
    
    hotspots = db.query(
        HotspotSnapshot.snapshot_date,
        func.count(HotspotSnapshot.id).label("hotspot_count"),
        func.sum(HotspotSnapshot.excess_dzd).label("total_excess")
    ).filter(
        HotspotSnapshot.snapshot_date >= start_date - timedelta(days=months*30),
        HotspotSnapshot.is_hotspot == True
    ).group_by(HotspotSnapshot.snapshot_date)\
     .order_by(HotspotSnapshot.snapshot_date)\
     .all()
    
    return {
        "labels": [h.snapshot_date.isoformat() for h in hotspots],
        "hotspot_count": [h.hotspot_count for h in hotspots],
        "total_excess_dzd": [float(h.total_excess) for h in hotspots]
    }
