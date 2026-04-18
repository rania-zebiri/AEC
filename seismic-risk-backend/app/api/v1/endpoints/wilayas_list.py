from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.wilaya import Wilaya
from app.models.contract import Contract
from sqlalchemy import func

router = APIRouter(prefix="/wilayas", tags=["Wilayas"])

@router.get("/all")
def get_all_wilayas(db: Session = Depends(get_db)):
    """Retourne TOUTES les wilayas avec leurs statistiques"""
    
    wilayas = db.query(
        Wilaya.id,
        Wilaya.code,
        Wilaya.name_fr,
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        func.coalesce(func.sum(Contract.capital_assure), 0).label("total_exposure"),
        func.count(Contract.id).label("contract_count")
    ).outerjoin(
        Contract, (Contract.wilaya_id == Wilaya.id) & (Contract.is_active == True)
    ).group_by(
        Wilaya.id, Wilaya.code, Wilaya.name_fr, Wilaya.rpa_zone, Wilaya.zone_score
    ).order_by(Wilaya.id).all()
    
    return [
        {
            "id": w.id,
            "code": w.code,
            "name_fr": w.name_fr,
            "rpa_zone": w.rpa_zone,
            "zone_score": float(w.zone_score),
            "total_exposure_dzd": float(w.total_exposure),
            "contract_count": w.contract_count
        }
        for w in wilayas
    ]