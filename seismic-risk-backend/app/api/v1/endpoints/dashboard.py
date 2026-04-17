from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Returns capital grouped by wilaya × CODE_SOUS_BRANCHE"""
    
    results = db.query(
        Wilaya.name_fr,
        Wilaya.rpa_zone,
        Contract.code_sous_branche,
        func.sum(Contract.capital_assure).label("total_capital"),
        func.count(Contract.id).label("contract_count")
    ).join(Contract, Contract.wilaya_id == Wilaya.id)\
     .filter(Contract.is_active == True)\
     .group_by(Wilaya.id, Wilaya.name_fr, Wilaya.rpa_zone, Contract.code_sous_branche)\
     .all()
    
    # Format response
    summary = {}
    for row in results:
        if row.name_fr not in summary:
            summary[row.name_fr] = {
                "wilaya": row.name_fr,
                "rpa_zone": row.rpa_zone,
                "categories": {}
            }
        summary[row.name_fr]["categories"][row.code_sous_branche] = {
            "total_capital_dzd": float(row.total_capital),
            "contract_count": row.contract_count
        }
    
    # Calculate totals
    total_capital = db.query(func.sum(Contract.capital_assure))\
                      .filter(Contract.is_active == True).scalar() or 0
    total_contracts = db.query(func.count(Contract.id))\
                        .filter(Contract.is_active == True).scalar() or 0
    
    return {
        "grouped_data": list(summary.values()),
        "totals": {
            "total_capital_dzd": float(total_capital),
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
    from app.models.risk_score import RiskScore
    avg_risk_score = db.query(func.avg(RiskScore.risk_score))\
                       .join(Contract, RiskScore.contract_id == Contract.id)\
                       .filter(Contract.is_active == True).scalar() or 0
    
    return {
        "total_exposure_dzd": float(total_exposure),
        "total_premium_dzd": float(total_premium),
        "active_contracts": active_contracts,
        "avg_risk_score": round(float(avg_risk_score), 1)
    }