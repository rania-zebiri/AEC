from core.rpa_zones import get_zone_by_wilaya

def simulate_p2p_sharing(portfolio_data: list, contribution_rate: float = 0.05) -> dict:
    """
    Simulates a P2P risk-sharing model.
    Logic:
    - Safe zones (0, I) "contribute" to the internal fund.
    - High-risk zones (IIb, III) "benefit" from the fund's protection.
    """
    if not portfolio_data:
        return {"fund_total": 0, "status": "Empty Portfolio"}

    fund_total = 0
    beneficiaries = []
    contributors = []

    for contract in portfolio_data:
        zone = get_zone_by_wilaya(contract['wilaya'])
        # Simplified: Use 5% of capital as a proxy for premium contribution
        pseudo_premium = contract['capital'] * 0.01 
        contribution = pseudo_premium * contribution_rate

        if zone in ["0", "I"]:
            fund_total += contribution
            contributors.append(contract['wilaya'])
        elif zone in ["IIb", "III"]:
            beneficiaries.append(contract['wilaya'])

    return {
        "fund_total_dzd": round(fund_total, 2),
        "contributing_wilayas": list(set(contributors)),
        "beneficiary_wilayas": list(set(beneficiaries)),
        "reduction_in_reinsurance_need": "Estimated 10-15%",
        "status": "Optimization Suggested" if fund_total > 0 else "Insufficient Fund"
    }