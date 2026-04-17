# seismic_risk_ai/core/underwriting.py

from seismic_risk_ai.core.rpa_zones import get_zone_by_location

def decide_underwriting(contract, portfolio=None, ai_score=None):
    """
    Decides if a building is acceptable based on RPA 99 Table 9.1
    and integrates an optional XGBoost AI score.
    """
    # --- 1. EXTRACT DATA FROM DICTIONARY ---
    wilaya = contract.get("wilaya", "UNKNOWN")
    commune = contract.get("commune", None)
    floors = contract.get("floors", 1)
    height = contract.get("height", 3)
    capital = contract.get("capital", 1000000)
    
    # Get the official zone
    zone = get_zone_by_location(wilaya, commune)
    
    # RPA 99 - Table 9.1 limits
    limits = {
        "0":   {"max_floors": 10, "max_height": 30},
        "I":   {"max_floors": 5,  "max_height": 17},
        "IIa": {"max_floors": 4,  "max_height": 14},
        "IIb": {"max_floors": 4,  "max_height": 14},
        "III": {"max_floors": 3,  "max_height": 11}
    }
    
    limit = limits.get(zone, limits["I"]) # Default to Zone I if unknown
    
    # --- 2. PHASE 1: RPA 99 COMPLIANCE (THE LAW) ---
    if floors > limit["max_floors"]:
        return {
            "decision": "REJECTED",
            "reason": f"Violation RPA 99 (Table 9.1): Max {limit['max_floors']} niveaux en Zone {zone}."
        }
        
    if height > limit["max_height"]:
        return {
            "decision": "REJECTED",
            "reason": f"Violation RPA 99: Hauteur {height}m dépasse la limite en Zone {zone}."
        }

    # --- 3. PHASE 2: XGBOOST AI SCORE (THE PREDICTION) ---
    if ai_score is not None:
        if ai_score > 0.80:
            return {
                "decision": "REJECTED",
                "reason": f"AI XGBoost: Risque statistique trop élevé ({ai_score*100}%)."
            }

    # --- 4. PRICING ---
    base_premium = capital * 0.001
    surcharge = 0.50 if zone == "III" else 0.25 if "II" in zone else 0.0
    final_premium = base_premium * (1 + surcharge)
    
    return {
        "decision": "ACCEPTED",
        "zone": zone,
        "final_premium": round(final_premium, 2)
    }