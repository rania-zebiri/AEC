def calculate_contract_score(contract):
    """
    Grades a building from 0 to 100 based on RPA 99 technical criteria.
    100 = Perfect Safety | 0 = Extreme Danger
    """
    score = 100
    
    # 1. Wall Thickness Check (RPA Requirement: Min 20cm)
    wall_thickness = contract.get("wall_thickness", 20) # default to 20
    if wall_thickness < 20:
        score -= 30  # Massive penalty: Dangerous structural weakness
        
    # 2. Plan Regularity (RPA Article 9.1.3: L/W < 3.5)
    length = contract.get("length", 10)
    width = contract.get("width", 5)
    ratio = length / width
    if ratio > 3.5:
        score -= 20  # Penalty: Building is too long/narrow, prone to twisting
        
    # 3. Structural System (RPA Article 9.1.1)
    # Only "Maçonnerie Chaînée" (Confined Masonry) is allowed
    is_chained = contract.get("is_chained", True)
    if not is_chained:
        score -= 40 # Major penalty: Masonry without reinforcements is a 'death trap'
        
    # 4. Age of Building
    year = contract.get("year_built", 2010)
    if year < 2003:
        score -= 10 # Built before current RPA version
        
    return max(0, score)