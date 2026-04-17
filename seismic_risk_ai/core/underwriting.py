from core.rpa_zones import get_zone_by_location

def decide_underwriting(contract, portfolio):
    """
    Decides if a building is acceptable based on RPA 99 Table 9.1
    and calculates a risk premium surcharge.
    """
    wilaya = contract.get("wilaya")
    commune = contract.get("commune")
    floors = contract.get("floors", 1)
    height = contract.get("height", 3) # in meters
    
    zone = get_zone_by_location(wilaya, commune)
    
    # RPA 99 - Table 9.1: Hauteur et nombre de niveaux limites
    #
    limits = {
        "0":   {"max_floors": 10, "max_height": 30}, # Very flexible in South
        "I":   {"max_floors": 5,  "max_height": 17},
        "IIa": {"max_floors": 4,  "max_height": 14},
        "IIb": {"max_floors": 4,  "max_height": 14},
        "III": {"max_floors": 3,  "max_height": 11}  # Very strict in Algiers
    }
    
    limit = limits.get(zone)
    
    # 1. TECHNICAL REJECTION LOGIC
    if floors > limit["max_floors"]:
        return {
            "decision": "REJECTED",
            "reason": f"Violation RPA 99 (Table 9.1): Max {limit['max_floors']} niveaux en Zone {zone}."
        }
        
    if height > limit["max_height"]:
        return {
            "decision": "REJECTED",
            "reason": f"Violation RPA 99: Hauteur {height}m dépasse la limite de {limit['max_height']}m en Zone {zone}."
        }

    # 2. PRICING SURCHARGE LOGIC
    base_premium = contract.get("capital") * 0.001 # 0.1% base
    surcharge = 0
    
    if zone == "III": surcharge = 0.50 # +50% for High Risk
    elif zone in ["IIa", "IIb"]: surcharge = 0.25 # +25%
    
    final_premium = base_premium * (1 + surcharge)
    
    return {
        "decision": "ACCEPTED",
        "zone": zone,
        "base_premium": round(base_premium, 2),
        "surcharge_pct": surcharge * 100,
        "final_premium": round(final_premium, 2),
        "notes": "Conforme aux principes architecturaux RPA 99."
    }