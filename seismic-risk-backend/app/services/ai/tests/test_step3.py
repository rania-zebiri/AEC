import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from seismic_risk_ai.core.analytics.pml_engine import calculate_pml

# Example: 1,000,000,000 DZD (1 Billion)
capital_test = 1000000000 
structure = "Beton Armé"
magnitude = 6.5

print(f"--- Simulating Earthquake: Magnitude {magnitude} ---")
result = calculate_pml(capital_test, structure, magnitude)

print(f"Structure Type:   {structure}")
print(f"Total Exposure:   {capital_test:,} DZD")
print(f"Estimated Loss:   {result['total_loss']:,} DZD")
print(f"Company Pays:     {result['net_loss']:,} DZD")
print(f"Reinsurer Pays:   {result['reinsurer_share']:,} DZD")