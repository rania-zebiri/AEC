from seismic_risk_ai.core.rpa_zones import get_zone_by_location
def calculate_portfolio_balance(portfolio_data: list) -> float:
    """
    Calculates the 'Balance Index' (0-100).
    Formula looks at the percentage of capital in high-risk zones (Zone III).
    Goal: High concentration in Zone III = Lower Balance Score.
    """
    if not portfolio_data:
        return 100.0

    total_capital = sum(c['capital'] for c in portfolio_data)
    capital_in_high_risk = 0
    
    for contract in portfolio_data:
        zone = get_zone_by_location(contract['wilaya'])
        if zone == "III":
            capital_in_high_risk += contract['capital']
            
    # Calculate the ratio of high-risk exposure
    high_risk_ratio = capital_in_high_risk / total_capital
    
    # Balance Index logic: 
    # If 0% is in Zone III -> 100 points
    # If 100% is in Zone III -> 0 points
    balance_score = (1 - high_risk_ratio) * 100
    
    return round(balance_score, 2)