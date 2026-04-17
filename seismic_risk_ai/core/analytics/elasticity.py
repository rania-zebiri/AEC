from seismic_risk_ai.core.rpa_zones import get_zone_by_location
def get_pricing_advice(wilaya: str, current_premium: float) -> dict:
    """
    Provides pricing recommendations based on seismic zone.
    Returns: Recommended change and strategic justification.
    """
    zone = get_zone_by_location(wilaya)
    
    # Pricing Strategy Logic
    if zone == "III":
        # Zone III: High demand for protection, less sensitive to price increases.
        suggested_change = 0.15 # Increase by 15%
        strategy = "Surcharge de sécurité (Zone à haut risque)"
        elasticity_label = "Faible (Inélastique)"
    elif zone in ["IIa", "IIb"]:
        suggested_change = 0.05 # Increase by 5%
        strategy = "Ajustement modéré"
        elasticity_label = "Moyenne"
    elif zone == "0":
        # Zone 0: Low perceived risk. Lower prices to win market share from competitors.
        suggested_change = -0.10 # Decrease by 10%
        strategy = "Offensive commerciale (Zone sécurisée)"
        elasticity_label = "Forte (Élastique)"
    else:
        suggested_change = 0.0
        strategy = "Maintenir le tarif actuel"
        elasticity_label = "Inconnue"

    new_premium = current_premium * (1 + suggested_change)
    
    return {
        "wilaya": wilaya,
        "zone": zone,
        "recommended_premium": round(new_premium, 2),
        "change_percent": f"{suggested_change * 100}%",
        "strategy": strategy,
        "elasticity": elasticity_label
    }