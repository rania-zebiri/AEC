from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.wilaya import Wilaya

router = APIRouter(prefix="/wilayas", tags=["Wilayas"])

@router.get("")
def get_all_wilayas(db: Session = Depends(get_db)):
    """Retourne toutes les wilayas"""
    wilayas = db.query(Wilaya).order_by(Wilaya.id).all()
    return [
        {
            "id": w.id,
            "code": w.code,
            "name_fr": w.name_fr,
            "name_ar": w.name_ar,
            "rpa_zone": w.rpa_zone,
            "zone_score": float(w.zone_score) if w.zone_score else 0
        }
        for w in wilayas
    ]