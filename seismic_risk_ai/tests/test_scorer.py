import sys
import os

# This adds the parent directory to the path so 'core' can be found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.risk_scorer import calculate_contract_score

def run_scorer_test():
    print("📋 TESTING RPA 99 STRUCTURAL SCORING\n")

    # CASE 1: The "Death Trap" (Building violating multiple RPA rules)
    # - Built in 1990 (Pre-RPA 2003)
    # - Walls too thin (15cm)
    # - Not reinforced (not chained)
    bad_building = {
        "wall_thickness": 15,
        "is_chained": False,
        "length": 40, 
        "width": 10,  # Ratio 4.0 (> 3.5 limit)
        "year_built": 1990
    }

    # CASE 2: The "Model Building" (Fully Compliant)
    # - Built in 2015
    # - 25cm walls
    # - Properly reinforced
    good_building = {
        "wall_thickness": 25,
        "is_chained": True,
        "length": 15, 
        "width": 10, # Ratio 1.5 (Safe)
        "year_built": 2015
    }

    print(f"--- Test: Non-Compliant Building ---")
    score_bad = calculate_contract_score(bad_building)
    print(f"Final Safety Score: {score_bad}/100")
    print("Status: ❌ CRITICAL RISK") if score_bad < 50 else print("Status: WARNING")
    
    print("\n--- Test: RPA-Compliant Building ---")
    score_good = calculate_contract_score(good_building)
    print(f"Final Safety Score: {score_good}/100")
    print("Status: ✅ ELIGIBLE FOR STANDARD PREMIUM")

if __name__ == "__main__":
    run_scorer_test()