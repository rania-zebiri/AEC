import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.underwriting import decide_underwriting

def run_underwriting_tests():
    print("🚀 RUNNING RPA 99 COMPLIANCE TESTS (Table 9.1)\n")

    # CASE 1: Valid Building in Alger (Zone III)
    # Limit for Zone III is 3 floors / 11 meters
    contract_1 = {
        "wilaya": "Alger",
        "commune": "Hydra",
        "floors": 2,
        "height": 7,
        "capital": 10_000_000
    }
    
    # CASE 2: Invalid Building in Alger (Zone III) - Too many floors
    contract_2 = {
        "wilaya": "Alger",
        "commune": "Bab El Oued",
        "floors": 5, 
        "height": 16,
        "capital": 15_000_000
    }

    # CASE 3: Building in the South (Zone 0) - Should be very flexible
    contract_3 = {
        "wilaya": "Adrar",
        "floors": 6,
        "height": 20,
        "capital": 8_000_000
    }

    test_cases = [
        ("Algerian Standard (Valid)", contract_1),
        ("Algerian High-Rise (Illegal)", contract_2),
        ("Sahara Construction (Safe Zone)", contract_3)
    ]

    for name, data in test_cases:
        result = decide_underwriting(data, [])
        print(f"--- Test: {name} ---")
        print(f"Location: {data['wilaya']} | Floors: {data['floors']}")
        print(f"Decision: {result['decision']}")
        if result['decision'] == "REJECTED":
            print(f"❌ Reason: {result['reason']}")
        else:
            print(f"✅ Zone: {result['zone']} | Premium: {result['final_premium']} DZD")
        print("-" * 30)

if __name__ == "__main__":
    run_underwriting_tests()