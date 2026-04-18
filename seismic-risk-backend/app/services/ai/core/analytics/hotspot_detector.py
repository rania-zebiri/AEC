def detect_hotspots(portfolio_data: list, capacity_per_wilaya: float = 1_000_000_000) -> list:
    """
    Analyzes the entire portfolio to find Wilayas where the concentration 
    of capital exceeds the company's financial capacity.
    
    Args:
        portfolio_data: List of dicts [{'wilaya': 'ALGER', 'capital': 500000}, ...]
        capacity_per_wilaya: The limit in DZD for any single wilaya.
        
    Returns:
        List of wilayas that are "Hotspots" with their excess amounts.
    """
    # 1. Aggregate capital by Wilaya
    wilaya_totals = {}
    for contract in portfolio_data:
        w = contract['wilaya'].upper().strip()
        cap = contract['capital']
        wilaya_totals[w] = wilaya_totals.get(w, 0) + cap
    
    # 2. Identify Hotspots
    hotspots = []
    for w, total in wilaya_totals.items():
        if total > capacity_per_wilaya:
            excess = total - capacity_per_wilaya
            percentage_over = (excess / capacity_per_wilaya) * 100
            hotspots.append({
                "wilaya": w,
                "total_exposure": round(total, 2),
                "excess": round(excess, 2),
                "severity": "CRITICAL" if percentage_over > 50 else "WARNING",
                "percentage_over": round(percentage_over, 1)
            })
            
    return hotspots