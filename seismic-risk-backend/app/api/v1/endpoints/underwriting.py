from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.core.database import get_db
from app.services.underwriting import UnderwritingEngine
from app.services.llm_api import ClaudeService
from app.core.logging import log_audit
from app.models.underwriting_decision import UnderwritingDecision
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType

router = APIRouter(prefix="/underwriting", tags=["Underwriting"])


class UnderwritingRequest(BaseModel):
    numero_police: str = Field(..., max_length=50)
    wilaya_id: int
    building_type_id: int
    code_sous_branche: str = Field(..., max_length=20)
    capital_proposed_dzd: float = Field(..., gt=0)
    date_effect: date
    date_expiration: date
    commune: str = Field(default="", max_length=100)
    generate_explanation: bool = Field(False)


class UnderwritingResponse(BaseModel):
    decision_id: int
    decision: str
    reason_fr: str
    risk_score: Optional[float]
    risk_level: Optional[str]
    remaining_capacity_dzd: Optional[float]
    conditions: Optional[List[str]]
    ai_explanation: Optional[str] = None


@router.post("/evaluate", response_model=UnderwritingResponse)
def evaluate_contract(
    request: UnderwritingRequest,
    req: Request,
    db: Session = Depends(get_db),
):
    """Evaluate a new contract for underwriting"""
    
    # Validate dates
    if request.date_effect >= request.date_expiration:
        raise HTTPException(status_code=400, detail="Date effect must be before date expiration")
    
    # Validate wilaya
    wilaya = db.query(Wilaya).filter(Wilaya.id == request.wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail=f"Wilaya {request.wilaya_id} not found")
    
    # Validate building type
    building_type = db.query(BuildingType).filter(BuildingType.id == request.building_type_id).first()
    if not building_type:
        raise HTTPException(status_code=404, detail=f"Building type {request.building_type_id} not found")
    
    # Check if policy number already exists
    existing = db.query(Contract).filter(
        Contract.numero_police == request.numero_police
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Policy number {request.numero_police} already exists")
    
    # Evaluate
    result = UnderwritingEngine.evaluate_contract(
        db=db,
        numero_police=request.numero_police,
        wilaya_id=request.wilaya_id,
        building_type_id=request.building_type_id,
        code_sous_branche=request.code_sous_branche,
        capital_proposed=request.capital_proposed_dzd,
        date_effect=request.date_effect,
        date_expiration=request.date_expiration,
        commune=request.commune,
        user_id=None,
        ip_address=req.client.host
    )
    
    # Generate AI explanation if requested (NO await - synchronous)
    ai_explanation = None
    if request.generate_explanation:
        ai_explanation = ClaudeService.generate_underwriting_narrative_sync(
            db, result
        )
    
    return UnderwritingResponse(
        decision_id=result["decision_id"],
        decision=result["decision"],
        reason_fr=result["reason_fr"],
        risk_score=result.get("risk_score"),
        risk_level=result.get("risk_level"),
        remaining_capacity_dzd=result.get("remaining_capacity"),
        conditions=result.get("conditions"),
        ai_explanation=ai_explanation
    )


@router.get("/decisions")
def get_underwriting_decisions(
    limit: int = 50,
    offset: int = 0,
    decision_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get underwriting decision history"""
    
    query = db.query(UnderwritingDecision)
    
    if decision_filter:
        query = query.filter(UnderwritingDecision.decision == decision_filter)
    
    total = query.count()
    decisions = query.order_by(UnderwritingDecision.decided_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "decisions": [
            {
                "id": d.id,
                "numero_police_input": d.numero_police_input,
                "decision": d.decision,
                "reason_fr": d.reason_fr,
                "risk_score_at_decision": float(d.risk_score_at_decision) if d.risk_score_at_decision else None,
                "capital_proposed_dzd": float(d.capital_proposed_dzd),
                "remaining_capacity_dzd": float(d.remaining_capacity_dzd) if d.remaining_capacity_dzd else None,
                "conditions": d.conditions_json,
                "decided_at": d.decided_at.isoformat() if d.decided_at else None,
                "contract_accepted": d.contract_id is not None
            }
            for d in decisions
        ],
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    }


@router.get("/decisions/{decision_id}")
def get_underwriting_decision(
    decision_id: int,
    db: Session = Depends(get_db)
):
    """Get specific underwriting decision"""
    
    decision = db.query(UnderwritingDecision).filter(
        UnderwritingDecision.id == decision_id
    ).first()
    
    if not decision:
        raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found")
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == decision.wilaya_id).first()
    building_type = db.query(BuildingType).filter(BuildingType.id == decision.building_type_id).first()
    
    return {
        "id": decision.id,
        "numero_police_input": decision.numero_police_input,
        "wilaya": wilaya.name_fr if wilaya else None,
        "building_type": building_type.label_fr if building_type else None,
        "code_sous_branche": decision.code_sous_branche,
        "capital_proposed_dzd": float(decision.capital_proposed_dzd),
        "decision": decision.decision,
        "reason_fr": decision.reason_fr,
        "conditions": decision.conditions_json,
        "risk_score_at_decision": float(decision.risk_score_at_decision) if decision.risk_score_at_decision else None,
        "remaining_capacity_dzd": float(decision.remaining_capacity_dzd) if decision.remaining_capacity_dzd else None,
        "ai_narrative": decision.ai_narrative,
        "decided_at": decision.decided_at.isoformat() if decision.decided_at else None,
        "contract_id": decision.contract_id
    }