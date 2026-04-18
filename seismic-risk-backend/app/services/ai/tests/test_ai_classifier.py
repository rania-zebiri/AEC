import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.underwriting import decide_underwriting

def test_hybrid_system():
    print("🤖 TESTING HYBRID SYSTEM: RPA 99 + XGBOOST AI\n")

    # CASE: A building that is LEGAL by law, but the AI finds it RISKY
    # Example: 3 floors in Alger (Legal per Table 9.1)
    # But built with old materials or in a high-claim history neighborhood
    contract_data = {
        "wilaya": "Alger",
        "commune": "Bab El Oued",
        "floors": 3,          # LEGAL (Max is 3)
        "height": 10,         # LEGAL (Max is 11)
        "year_built": 2005,
        "is_chained": True,
        "historical_claim_zone": True # This is a custom feature for the AI
    }

    print(f"Checking building in {contract_data['wilaya']}...")
    
    # We simulate the AI score here (usually 0.0 to 1.0)
    # In your real code, this would come from model.predict()
    ai_probability = 0.85 # 85% chance of earthquake damage
    
    result = decide_underwriting(contract_data, ai_score=ai_probability)

    print(f"RPA Law Status: COMPLIANT ✅")
    print(f"AI XGBoost Risk Probability: {ai_probability * 100}%")
    print(f"FINAL DECISION: {result['decision']}")
    
    if result['decision'] == "REJECTED":
        print(f"❌ Reason: {result['reason']}")
    else:
        print(f"✅ Premium Calculated: {result['final_premium']} DZD")

if __name__ == "__main__":
    test_hybrid_system()