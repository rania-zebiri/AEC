from seismic_risk_ai.core.vulnerability import get_vulnerability_factor

def calculate_pml(capital: float, structure_type: str, magnitude: float, retention_rate: float = 0.2) -> dict:
    """
    Calculates the financial loss based on the formula:
    Loss = Capital * Vulnerability * Intensity_Factor
    
    Args:
        capital: The total insured value (Sum Insured) in DZD.
        structure_type: e.g., 'Beton Armé'.
        magnitude: Earthquake magnitude (e.g., 6.5).
        retention_rate: The % of risk the company keeps (default 20%).
        
    Returns:
        A dictionary with Total Loss, Reinsurer Share, and Net Company Share.
    """
    # 1. Get Physical Vulnerability
    vuln_factor = get_vulnerability_factor(structure_type)
    
    # 2. Calculate Intensity Factor (Exponential relationship to Magnitude)
    # A Magnitude 7.5 is considered a 'Total Loss' scenario for fragile buildings.
    intensity_factor = min(1.0, (magnitude / 7.5) ** 2.5)
    
    # 3. Calculate Total Loss
    total_loss = capital * vuln_factor * intensity_factor
    
    # 4. Split between Company and Reinsurer
    net_loss = total_loss * retention_rate
    reinsurer_share = total_loss - net_loss
    
    return {
        "total_loss": round(total_loss, 2),
        "net_loss": round(net_loss, 2),
        "reinsurer_share": round(reinsurer_share, 2),
        "intensity_applied": round(intensity_factor, 4)
    }