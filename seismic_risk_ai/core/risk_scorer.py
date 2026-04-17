from core.rpa_zones import get_zone_by_wilaya
from core.vulnerability import get_vulnerability_factor

def calculate_contract_score(wilaya: str, structure_type: str, capital: float) -> dict:
    """
    Computes a risk score (0-100) for a specific contract.
    Logic:
    - Zone Weight (50%): Zone III = 50 pts, Zone 0 = 0 pts.
    - Vulnerability Weight (30%): Fragile = 30 pts, Resistant = 5 pts.
    - Capital Weight (20%): Scale based on the amount (logarithmic).
    """
    # 1. Zone Score (0 - 50)
    zone = get_zone_by_wilaya(wilaya)
    zone_map = {"0": 0, "I": 10, "IIa": 25, "IIb": 35, "III": 50}
    zone_score = zone_map.get(zone, 25) # Default to moderate if unknown

    # 2. Vulnerability Score (0 - 30)
    vuln_factor = get_vulnerability_factor(structure_type)
    vuln_score = vuln_factor * 30

    # 3. Capital Exposure Score (0 - 20)
    # We use 1 Billion DZD as a benchmark for a 'High' exposure score
    cap_score = min(20, (capital / 1_000_000_000) * 20)

    total_score = round(zone_score + vuln_score + cap_score, 2)
    
    # Risk Level Tag
    if total_score > 70: label = "CRITIQUE"
    elif total_score > 40: label = "MODÉRÉ"
    else: label = "FAIBLE"

    return {
        "score": total_score,
        "label": label,
        "details": {
            "zone_contribution": zone_score,
            "vuln_contribution": round(vuln_score, 2),
            "capital_contribution": round(cap_score, 2)
        }
    }