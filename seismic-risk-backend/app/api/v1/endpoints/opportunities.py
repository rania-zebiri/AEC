from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.contract import Contract
from app.models.wilaya import Wilaya

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


def _build_opportunities(
    results,
    max_zone_score: float,
    max_exposure_dzd: float
) -> list:
    """Pure scoring logic, shared by both endpoints."""
    opportunities = []

    for row in results:
        exposure   = float(row.current_exposure_dzd) if row.current_exposure_dzd else 0.0
        zone_score = float(row.zone_score)            if row.zone_score           else 0.0
        pop_growth = float(row.population_growth_pct) if row.population_growth_pct else 0.0

        if zone_score > max_zone_score:
            continue
        if exposure >= max_exposure_dzd:
            continue

        growth_score      = min(100.0, pop_growth * 20.0)
        competition_score = {"LOW": 100.0, "MEDIUM": 60.0, "HIGH": 30.0}.get(row.competition_level, 50.0)
        exposure_score    = max(0.0, 100.0 - (exposure / max_exposure_dzd * 100.0))
        zone_score_value  = {"0": 100.0, "I": 85.0, "IIa": 60.0, "IIb": 30.0, "III": 0.0}.get(row.rpa_zone, 40.0)

        opportunity_score = (
            growth_score      * 0.35 +
            competition_score * 0.20 +
            exposure_score    * 0.25 +
            zone_score_value  * 0.20
        )

        if opportunity_score >= 70:
            opportunity_level, color = "HIGH",   "#22c55e"
        elif opportunity_score >= 40:
            opportunity_level, color = "MEDIUM", "#eab308"
        else:
            opportunity_level, color = "LOW",    "#6b7280"

        if exposure == 0:
            reason = (
                f"{row.name_fr} - Zone {row.rpa_zone} with {pop_growth}% population growth "
                f"and no existing contracts. Very high potential for expansion."
            )
        else:
            reason = (
                f"{row.name_fr} - Zone {row.rpa_zone} with {pop_growth}% population growth "
                f"and only {int(exposure / 1_000_000)}M insured. High potential for expansion."
            )

        products_by_zone = {
            "0":   ["SME Multi-risk", "Agricultural", "Solar Farm Coverage", "Commercial Property"],
            "I":   ["Agribusiness Multi-risk", "Cold Storage Coverage", "Commercial Property"],
            "IIa": ["Selective Commercial Only", "Industrial Fire"],
        }

        opportunities.append({
            "id":                   row.id,
            "code":                 row.code,
            "name_fr":              row.name_fr,
            "rpa_zone":             row.rpa_zone,
            "zone_score":           zone_score,
            "latitude":             float(row.latitude)  if row.latitude  else None,
            "longitude":            float(row.longitude) if row.longitude else None,
            "population_growth_pct": pop_growth,
            "competition_level":    row.competition_level,
            "current_exposure_dzd": exposure,
            "contract_count":       row.contract_count,
            "opportunity_score":    round(opportunity_score, 1),
            "opportunity_level":    opportunity_level,
            "color":                color,
            "available_capacity_dzd": max(0.0, max_exposure_dzd - exposure),
            "reason":               reason,
            "products":             products_by_zone.get(row.rpa_zone, ["Commercial Property", "SME Multi-risk"]),
        })

    opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)
    return opportunities


def _query_wilayas(db: Session):
    return db.query(
        Wilaya.id,
        Wilaya.code,
        Wilaya.name_fr,
        Wilaya.rpa_zone,
        Wilaya.zone_score,
        Wilaya.latitude,
        Wilaya.longitude,
        Wilaya.population_growth_pct,
        Wilaya.competition_level,
        func.coalesce(func.sum(Contract.capital_assure), 0).label("current_exposure_dzd"),
        func.count(Contract.id).label("contract_count"),
    ).outerjoin(
        Contract,
        (Contract.wilaya_id == Wilaya.id) & (Contract.is_active == True)
    ).group_by(
        Wilaya.id, Wilaya.code, Wilaya.name_fr, Wilaya.rpa_zone,
        Wilaya.zone_score, Wilaya.latitude, Wilaya.longitude,
        Wilaya.population_growth_pct, Wilaya.competition_level,
    ).all()


@router.get("/map")
def get_opportunity_map(
    max_zone_score:   float = Query(1.5,         description="Maximum zone score for safe zones"),
    max_exposure_dzd: float = Query(500_000_000, description="Maximum exposure to consider under-exploited"),
    db: Session = Depends(get_db)
):
    """Selling Opportunity Map — real DB data."""
    results = _query_wilayas(db)
    return _build_opportunities(results, max_zone_score, max_exposure_dzd)


@router.get("/top-wilayas")
def get_top_opportunities(
    limit:            int   = Query(10,          ge=1, le=50),
    max_zone_score:   float = Query(1.5),
    max_exposure_dzd: float = Query(500_000_000),
    db: Session = Depends(get_db)
):
    """Returns top N wilayas with highest opportunity score."""
    results = _query_wilayas(db)
    opportunities = _build_opportunities(results, max_zone_score, max_exposure_dzd)
    return opportunities[:limit]