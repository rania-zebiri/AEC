 # /app/api/v1/endpoints/segmentation.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore

router = APIRouter(prefix="/segmentation", tags=["Segmentation"])


from sqlalchemy import distinct

@router.get("/filter")
def filter_contracts(
    limit: int = Query(1000, ge=1, le=5000),  # ← raise default limit
    offset: int = Query(0, ge=0),
    wilaya_id: Optional[int] = None,
    zone: Optional[str] = None,
    code_sous_branche: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Step 1: build the ID subquery first (clean distinct)
    id_query = (
        db.query(Contract.id)
        .join(Wilaya, Contract.wilaya_id == Wilaya.id)
        .filter(Contract.is_active == True)
    )

    if wilaya_id:
        id_query = id_query.filter(Contract.wilaya_id == wilaya_id)

    if zone:
        id_query = id_query.filter(
            func.upper(func.trim(Wilaya.rpa_zone)) == zone.strip().upper()
        )

    if code_sous_branche:
        id_query = id_query.filter(Contract.code_sous_branche == code_sous_branche)

    # distinct IDs only
    valid_ids = [row[0] for row in id_query.distinct().all()]
    total_count = len(valid_ids)

    # Step 2: paginate on the clean ID list
    paginated_ids = valid_ids[offset: offset + limit]

    # Step 3: fetch full objects with joinedload (no distinct needed now)
    contracts = (
        db.query(Contract)
        .options(
            joinedload(Contract.wilaya),
            joinedload(Contract.building_type),
        )
        .filter(Contract.id.in_(paginated_ids))
        .order_by(Contract.id)
        .all()
    )

    # Step 4: risk scores in one query
    risk_scores_map = {}
    if paginated_ids:
        risk_scores = (
            db.query(RiskScore)
            .filter(RiskScore.contract_id.in_(paginated_ids))
            .all()
        )
        risk_scores_map = {rs.contract_id: rs for rs in risk_scores}

    # ... rest of result building unchanged

    result = []
    for contract in contracts:
        risk_score = risk_scores_map.get(contract.id)

        result.append({
            "id": contract.id,
            "numero_police": contract.numero_police,
            "code_sous_branche": contract.code_sous_branche,
            "num_avnt_cours": contract.num_avnt_cours,
            "date_effect": contract.date_effect.isoformat() if contract.date_effect else None,
            "date_expiration": contract.date_expiration.isoformat() if contract.date_expiration else None,
            "type": contract.type,
            "commune": contract.commune,
            "capital_assure_dzd": float(contract.capital_assure) if contract.capital_assure else 0,
            "capital_assure": float(contract.capital_assure) if contract.capital_assure else 0,
            "prime_nette": float(contract.prime_nette) if contract.prime_nette else 0,
            "is_active": contract.is_active,
            "imported_at": contract.imported_at.isoformat() if contract.imported_at else None,
            "updated_at": contract.updated_at.isoformat() if contract.updated_at else None,
            "wilaya": {
                "id": contract.wilaya.id,
                "name_fr": contract.wilaya.name_fr,
                "code": contract.wilaya.code,
                # FIX: strip le rpa_zone à la source pour que le frontend reçoive une valeur propre
                "rpa_zone": contract.wilaya.rpa_zone.strip() if contract.wilaya.rpa_zone else None,
                "zone_score": float(contract.wilaya.zone_score) if contract.wilaya.zone_score else 0,
            } if contract.wilaya else None,
            "wilaya_id": contract.wilaya_id,
            "wilaya_name": contract.wilaya.name_fr if contract.wilaya else None,
            "rpa_zone": contract.wilaya.rpa_zone.strip() if contract.wilaya and contract.wilaya.rpa_zone else None,
            "building_type": contract.building_type.label_fr if contract.building_type else None,
            "building_type_id": contract.building_type_id,
            "vulnerability_factor": float(contract.building_type.vulnerability_factor) if contract.building_type and contract.building_type.vulnerability_factor else 0.5,
            "risk_score": float(risk_score.risk_score) if risk_score else 50,
            "risk_level": risk_score.risk_level if risk_score else "MEDIUM",
        })

    return {
        "contracts": result,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "filters_applied": {
            "wilaya_id": wilaya_id,
            "zone": zone,
            "code_sous_branche": code_sous_branche,
            "is_active": True,
        },
    }


@router.get("/wilayas")
def get_wilayas(db: Session = Depends(get_db)):
    """Retourne la liste de toutes les wilayas."""
    wilayas = db.query(Wilaya).order_by(Wilaya.id).all()

    return [
        {
            "id": w.id,
            "code": w.code,
            "name_fr": w.name_fr,
            "name_ar": w.name_ar,
            # FIX: strip partout
            "rpa_zone": w.rpa_zone.strip() if w.rpa_zone else None,
            "zone_score": float(w.zone_score) if w.zone_score else 0,
            "region": w.region,
            "population_growth_pct": float(w.population_growth_pct) if w.population_growth_pct else 0,
            "competition_level": w.competition_level,
        }
        for w in wilayas
    ]


@router.get("/building-types")
def get_building_types(db: Session = Depends(get_db)):
    """Retourne la liste de tous les types de bâtiments."""
    building_types = db.query(BuildingType).order_by(BuildingType.id).all()

    return [
        {
            "id": bt.id,
            "code": bt.code,
            "label_fr": bt.label_fr,
            "vulnerability_factor": float(bt.vulnerability_factor) if bt.vulnerability_factor else 0,
            "risk_category": bt.risk_category,
            "description": bt.description,
        }
        for bt in building_types
    ]


@router.get("/stats")
def get_segmentation_stats(db: Session = Depends(get_db)):
    """Retourne les statistiques globales de segmentation."""

    total_contracts = (
        db.query(Contract).filter(Contract.is_active == True).count()
    )

    total_exposure = (
        db.query(func.sum(Contract.capital_assure))
        .filter(Contract.is_active == True)
        .scalar()
        or 0
    )

    exposure_by_zone = (
        db.query(
            func.trim(Wilaya.rpa_zone).label("zone"),
            func.sum(Contract.capital_assure).label("total"),
        )
        .join(Contract, Wilaya.id == Contract.wilaya_id)
        .filter(Contract.is_active == True)
        .group_by(func.trim(Wilaya.rpa_zone))
        .all()
    )

    contracts_by_zone = (
        db.query(
            func.trim(Wilaya.rpa_zone).label("zone"),
            func.count(Contract.id).label("count"),
        )
        .join(Contract, Wilaya.id == Contract.wilaya_id)
        .filter(Contract.is_active == True)
        .group_by(func.trim(Wilaya.rpa_zone))
        .all()
    )

    return {
        "total_contracts": total_contracts,
        "total_exposure_dzd": float(total_exposure),
        "exposure_by_zone": [
            {"zone": z[0], "exposure_dzd": float(z[1])} for z in exposure_by_zone
        ],
        "contracts_by_zone": [
            {"zone": z[0], "count": z[1]} for z in contracts_by_zone
        ],
    }

