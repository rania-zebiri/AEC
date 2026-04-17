from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.contract import Contract
from app.models.risk_score import RiskScore
from app.models.wilaya import Wilaya
from app.services.risk_scorer import RiskScorer

router = APIRouter(prefix="/client-score", tags=["Client Score"])


@router.get("/{policy_id}")
def get_client_risk_score(
    policy_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns risk score 0-100 for one policy with color badge
    """
    
    # Try to find by numero_police or id
    contract = None
    if policy_id.isdigit():
        contract = db.query(Contract).filter(Contract.id == int(policy_id)).first()
    
    if not contract:
        contract = db.query(Contract).filter(Contract.numero_police == policy_id).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail=f"Policy {policy_id} not found")
    
    risk_score = db.query(RiskScore).filter(RiskScore.contract_id == contract.id).first()
    
    if not risk_score:
        # Compute on the fly if not exists
        risk_score = RiskScorer.compute_and_save(db, contract.id)
    
    # Color based on risk level
    color_map = {
        "LOW": {"color": "#22c55e", "bg": "#dcfce7", "text": "Faible"},
        "MEDIUM": {"color": "#eab308", "bg": "#fef9c3", "text": "Moyen"},
        "HIGH": {"color": "#f97316", "bg": "#ffedd5", "text": "Élevé"},
        "CRITICAL": {"color": "#ef4444", "bg": "#fee2e2", "text": "Critique"}
    }
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == contract.wilaya_id).first()
    
    # Get rank among all contracts
    higher_scores = db.query(func.count(RiskScore.id)).filter(
        RiskScore.risk_score > risk_score.risk_score
    ).scalar() or 0
    total_scores = db.query(func.count(RiskScore.id)).filter(
        RiskScore.contract.has(is_active=True)
    ).scalar() or 1
    percentile = (higher_scores / total_scores * 100)
    
    return {
        "contract_id": contract.id,
        "numero_police": contract.numero_police,
        "wilaya": {
            "id": wilaya.id if wilaya else None,
            "name_fr": wilaya.name_fr if wilaya else None,
            "rpa_zone": wilaya.rpa_zone if wilaya else None,
            "zone_score": float(wilaya.zone_score) if wilaya else None
        },
        "code_sous_branche": contract.code_sous_branche,
        "capital_assure_dzd": float(contract.capital_assure),
        "prime_nette_dzd": float(contract.prime_nette),
        "date_effect": contract.date_effect.isoformat(),
        "date_expiration": contract.date_expiration.isoformat(),
        "commune": contract.commune,
        "risk_score": float(risk_score.risk_score),
        "risk_level": risk_score.risk_level,
        "risk_text": color_map.get(risk_score.risk_level, {"text": "Inconnu"})["text"],
        "color": color_map.get(risk_score.risk_level, {"color": "#6b7280"})["color"],
        "bg_color": color_map.get(risk_score.risk_level, {"bg": "#f3f4f6"})["bg"],
        "components": {
            "zone_score_component": float(risk_score.zone_score_component) if risk_score.zone_score_component else None,
            "vuln_component": float(risk_score.vuln_component) if risk_score.vuln_component else None,
            "capital_component": float(risk_score.capital_component) if risk_score.capital_component else None
        },
        "percentile": round(percentile, 1),
        "is_top_10_percent": percentile >= 90
    }


@router.get("/batch/")
def get_batch_risk_scores(
    policy_ids: List[str] = Query(..., description="List of policy numbers"),
    db: Session = Depends(get_db)
):
    """Returns risk scores for multiple policies"""
    
    results = []
    for policy_id in policy_ids:
        try:
            result = get_client_risk_score(policy_id, db)
            results.append(result)
        except HTTPException:
            results.append({
                "numero_police": policy_id,
                "error": "Policy not found",
                "risk_score": None
            })
    
    return {"results": results}


@router.get("/portfolio/distribution")
def get_risk_score_distribution(
    db: Session = Depends(get_db)
):
    """Returns distribution of risk scores across portfolio"""
    
    distribution = db.query(
        RiskScore.risk_level,
        func.count(RiskScore.id).label("count"),
        func.sum(Contract.capital_assure).label("total_capital")
    ).join(Contract, RiskScore.contract_id == Contract.id)\
     .filter(Contract.is_active == True)\
     .group_by(RiskScore.risk_level)\
     .all()
    
    total_contracts = sum(d.count for d in distribution)
    total_capital = sum(float(d.total_capital) for d in distribution if d.total_capital)
    
    return {
        "distribution": [
            {
                "level": d.risk_level,
                "count": d.count,
                "percentage": round(d.count / total_contracts * 100, 1) if total_contracts > 0 else 0,
                "total_capital_dzd": float(d.total_capital) if d.total_capital else 0,
                "capital_percentage": round(float(d.total_capital) / total_capital * 100, 1) if total_capital > 0 else 0
            }
            for d in distribution
        ],
        "summary": {
            "total_contracts": total_contracts,
            "total_capital_dzd": total_capital,
            "avg_risk_score": db.query(func.avg(RiskScore.risk_score)).join(
                Contract, RiskScore.contract_id == Contract.id
            ).filter(Contract.is_active == True).scalar() or 0
        }
    }