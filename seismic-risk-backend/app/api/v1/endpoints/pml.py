from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.core.database import get_db
from app.services.pml_engine import PMLEngine
from app.services.llm_api import ClaudeService
from app.core.logging import log_audit
from app.models.wilaya import Wilaya
from app.models.pml_simulation import PMLSimulation

router = APIRouter(prefix="/pml", tags=["PML"])


class PMLRequest(BaseModel):
    wilaya_id: int = Field(..., description="Wilaya ID to simulate", ge=1, le=58)
    magnitude: float = Field(..., description="Earthquake magnitude", ge=4.0, le=8.5)
    scenario_month: Optional[date] = Field(None, description="Month for historical simulation")
    generate_narrative: bool = Field(False, description="Generate AI narrative")


class PMLResponse(BaseModel):
    simulation_id: int
    wilaya_id: int
    wilaya_name: str
    magnitude: float
    total_capital_dzd: float
    contract_count: int
    expected_loss_dzd: float
    reinsurance_cover_dzd: float
    net_company_loss_dzd: float
    loss_ratio_pct: float
    intensity_factor_used: float
    ai_narrative: Optional[str] = None


@router.post("/simulate", response_model=PMLResponse)
def simulate_pml(
    request: PMLRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Calculate PML for a given wilaya and magnitude"""
    
    # Verify wilaya exists
    wilaya = db.query(Wilaya).filter(Wilaya.id == request.wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail=f"Wilaya {request.wilaya_id} not found")
    
    # Calculate PML
    result = PMLEngine.calculate_pml(
        db=db,
        wilaya_id=request.wilaya_id,
        magnitude=request.magnitude,
        scenario_month=request.scenario_month,
        user_id=None
    )
    
    # Generate AI narrative if requested
    if request.generate_narrative:
        narrative = ClaudeService.generate_pml_narrative_sync(
            db, result["simulation_id"], result
        )
        result["ai_narrative"] = narrative
    
    # Log audit
    log_audit(
        db=db,
        user_id=None,
        action="PML_RUN",
        entity_type="pml_simulations",
        entity_id=result["simulation_id"],
        details={
            "wilaya_id": request.wilaya_id,
            "wilaya_name": wilaya.name_fr,
            "magnitude": request.magnitude,
            "expected_loss": result["expected_loss_dzd"]
        }
    )
    
    return PMLResponse(
        simulation_id=result["simulation_id"],
        wilaya_id=result["wilaya_id"],
        wilaya_name=result["wilaya_name"],
        magnitude=result["magnitude"],
        total_capital_dzd=result["total_capital_dzd"],
        contract_count=result["contract_count"],
        expected_loss_dzd=result["expected_loss_dzd"],
        reinsurance_cover_dzd=result["reinsurance_cover_dzd"],
        net_company_loss_dzd=result["net_company_loss_dzd"],
        loss_ratio_pct=result["loss_ratio_pct"],
        intensity_factor_used=result["intensity_factor_used"],
        ai_narrative=result.get("ai_narrative")
    )


@router.post("/simulate-portfolio")
def simulate_portfolio_pml(
    magnitude: float = Query(..., description="Earthquake magnitude", ge=4.0, le=8.5),
    db: Session = Depends(get_db)
):
    """Calculate PML for entire portfolio"""
    
    wilayas = db.query(Wilaya).all()
    
    total_loss = 0
    total_capital = 0
    results = []
    
    for wilaya in wilayas:
        pml_result = PMLEngine.calculate_pml(db, wilaya.id, magnitude, None, None)
        results.append({
            "wilaya_name": pml_result["wilaya_name"],
            "expected_loss_dzd": pml_result["expected_loss_dzd"],
            "loss_ratio_pct": pml_result["loss_ratio_pct"]
        })
        total_loss += pml_result["expected_loss_dzd"]
        total_capital += pml_result["total_capital_dzd"]
    
    return {
        "magnitude": magnitude,
        "total_portfolio_loss_dzd": total_loss,
        "total_portfolio_capital_dzd": total_capital,
        "portfolio_loss_ratio_pct": (total_loss / total_capital * 100) if total_capital > 0 else 0,
        "wilaya_results": results
    }


@router.get("/history")
def get_pml_history(
    wilaya_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get PML simulation history"""
    
    query = db.query(PMLSimulation)
    if wilaya_id:
        query = query.filter(PMLSimulation.wilaya_id == wilaya_id)
    
    total = query.count()
    simulations = query.order_by(PMLSimulation.simulated_at.desc()).offset(offset).limit(limit).all()
    
    return {
        "simulations": [
            {
                "id": s.id,
                "wilaya_id": s.wilaya_id,
                "magnitude": float(s.magnitude),
                "scenario_month": s.scenario_month.isoformat() if s.scenario_month else None,
                "expected_loss_dzd": float(s.expected_loss_dzd),
                "net_company_loss_dzd": float(s.net_company_loss_dzd),
                "loss_ratio_pct": float(s.loss_ratio_pct),
                "simulated_at": s.simulated_at.isoformat() if s.simulated_at else None,
                "has_narrative": s.ai_narrative is not None
            }
            for s in simulations
        ],
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total
        }
    }


@router.get("/simulation/{simulation_id}")
def get_pml_simulation(
    simulation_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed PML simulation by ID"""
    
    simulation = db.query(PMLSimulation).filter(PMLSimulation.id == simulation_id).first()
    if not simulation:
        raise HTTPException(status_code=404, detail=f"Simulation {simulation_id} not found")
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == simulation.wilaya_id).first()
    
    return {
        "id": simulation.id,
        "wilaya": {
            "id": wilaya.id,
            "name_fr": wilaya.name_fr,
            "rpa_zone": wilaya.rpa_zone
        } if wilaya else None,
        "magnitude": float(simulation.magnitude),
        "scenario_month": simulation.scenario_month.isoformat() if simulation.scenario_month else None,
        "total_capital_dzd": float(simulation.total_capital_dzd),
        "contract_count": simulation.contract_count,
        "expected_loss_dzd": float(simulation.expected_loss_dzd),
        "reinsurance_cover_dzd": float(simulation.reinsurance_cover_dzd),
        "net_company_loss_dzd": float(simulation.net_company_loss_dzd),
        "loss_ratio_pct": float(simulation.loss_ratio_pct),
        "intensity_factor_used": float(simulation.intensity_factor_used),
        "ai_narrative": simulation.ai_narrative,
        "simulated_at": simulation.simulated_at.isoformat() if simulation.simulated_at else None
    }