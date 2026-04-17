import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.elasticity import get_pricing_advice

# Current base premium for a standard house: 50,000 DZD
base_price = 50000

print("--- Testing Pricing Advisor ---")

# Scenario 1: High Risk
advice_alger = get_pricing_advice("Alger", base_price)
print(f"Alger (Zone III): Suggests {advice_alger['change_percent']} -> {advice_alger['strategy']}")

# Scenario 2: Safe Zone
advice_adrar = get_pricing_advice("Adrar", base_price)
print(f"Adrar (Zone 0):   Suggests {advice_adrar['change_percent']} -> {advice_adrar['strategy']}")