from core.risk_scorer import calculate_contract_score
from core.hotspot_detector import detect_hotspots

def decide_underwriting(new_contract: dict, portfolio_data: list, capacity_limit: float = 1_000_000_000) -> dict:
    """
    Automated decision for new insurance submissions.
    
    Args:
        new_contract: {'wilaya': 'Alger', 'structure': 'Pierre', 'capital': 200000000}
        portfolio_data: Current existing contracts.
    """
    # 1. Calculate individual risk score
    score_result = calculate_contract_score(
        new_contract['wilaya'], 
        new_contract['structure'], 
        new_contract['capital']
    )
    score = score_result['score']
    
    # 2. Check current concentration in that wilaya
    wilaya_exposure = sum(c['capital'] for c in portfolio_data if c['wilaya'].upper() == new_contract['wilaya'].upper())
    remaining_capacity = capacity_limit - wilaya_exposure
    
    # 3. Decision Logic
    decision = "ACCEPT"
    reason = "Risk within safe limits."
    
    if score > 80:
        decision = "REJECT"
        reason = f"Individual risk score ({score}) is too high for this building type/zone."
    elif new_contract['capital'] > remaining_capacity:
        if remaining_capacity <= 0:
            decision = "REJECT"
            reason = f"Wilaya {new_contract['wilaya']} is at full capacity. No more risks accepted."
        else:
            decision = "CONDITIONAL"
            reason = f"Limited capacity. Only {remaining_capacity:,} DZD can be accepted for this wilaya."
            
    return {
        "decision": decision,
        "reason": reason,
        "risk_score": score,
        "wilaya_status": "FULL" if remaining_capacity <= 0 else "AVAILABLE"
    }