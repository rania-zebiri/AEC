import joblib
import xgboost as xgb
import pandas as pd
from seismic_risk_ai.core.underwriting import decide_underwriting

def test_single_building(building_data):
    print(f"\n🧐 ANALYZING BUILDING IN: {building_data['wilaya']}")
    print("-" * 40)

    # 1. LOAD THE TRAINED "BRAIN" (XGBoost)
    model = xgb.XGBClassifier()
    model.load_model("seismic_risk_ai/core/models/catnat_xgb_model.json")
    # 2. LOAD THE "TRANSLATOR" (Encoder)
    le = joblib.load("seismic_risk_ai/core/models/wilaya_encoder.joblib")
    
    # 3. PREPARE THE DATA FOR THE AI
    # We clean the name and turn it into a number the AI understands
    clean_name = building_data['wilaya'].upper()
    try:
        wilaya_encoded = le.transform([clean_name])[0]
    except:
        print(f"⚠️ Wilaya {clean_name} not found in history. Using default.")
        wilaya_encoded = 0

    # 4. GET THE AI PROBABILITY
    # We pass [Wilaya_Code, Capital] just like we trained it
    input_features = pd.DataFrame([[wilaya_encoded, building_data['capital']]], 
                                 columns=['wilaya_enc', 'CAPITAL_ASSURE'])
    
    ai_probability = model.predict_proba(input_features)[0][1] # Probability of "High Risk"

    # 5. RUN THROUGH THE HYBRID JUDGE (RPA Law + AI Score)
    final_result = decide_underwriting(building_data, ai_score=ai_probability)

    # 6. SHOW RESULTS
    print(f"RPA Zone: {final_result.get('zone', 'N/A')}")
    print(f"AI Risk Probability: {ai_probability*100:.2f}%")
    print(f"FINAL DECISION: {final_result['decision']}")
    if final_result['decision'] == "REJECTED":
        print(f"❌ REASON: {final_result['reason']}")
    else:
        print(f"✅ CALCULATED PREMIUM: {final_result['final_premium']} DZD")

# --- TEST CASES ---
if __name__ == "__main__":
    # Case A: A building in Algiers (High Risk Zone) with many floors
    building_1 = {
        "wilaya": "ALGER",
        "commune": "BAB EL OUED",
        "floors": 5,          # Should be rejected by RPA (Zone III max is 3)
        "height": 18,
        "capital": 5000000
    }

    # Case B: A safe-looking building in a High Risk area
    building_2 = {
        "wilaya": "ALGER",
        "commune": "HYDRA",
        "floors": 2,          # Legal
        "height": 7,           # Legal
        "capital": 10000000
    }

    test_single_building(building_1)
    test_single_building(building_2)