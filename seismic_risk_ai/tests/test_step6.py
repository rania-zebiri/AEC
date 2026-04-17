import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.underwriting import decide_underwriting

# Current portfolio has 1.5 Billion in Alger (Already over the 1 Billion limit)
current_portfolio = [{"wilaya": "Alger", "capital": 1_500_000_000}]

# 1. New contract in Alger (Should be rejected due to capacity)
new_1 = {"wilaya": "Alger", "structure": "Beton Armé", "capital": 100_000_000}

# 2. New contract in Adrar (Safe zone, should be accepted)
new_2 = {"wilaya": "Adrar", "structure": "Beton Armé", "capital": 100_000_000}

print("--- Testing Underwriting Assistant ---")
res1 = decide_underwriting(new_1, current_portfolio)
print(f"Submission 1 (Alger): {res1['decision']} - Reason: {res1['reason']}")

res2 = decide_underwriting(new_2, []) # Empty portfolio for Adrar
print(f"Submission 2 (Adrar): {res2['decision']} - Reason: {res2['reason']}")