import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.p2p_simulator import simulate_p2p_sharing

# Portfolio: One big project in Adrar (contributor) and one in Alger (beneficiary)
sample_portfolio = [
    {"wilaya": "Adrar", "capital": 1_000_000_000},
    {"wilaya": "Alger", "capital": 500_000_000}
]

print("--- Testing P2P Risk Sharing Simulator ---")
results = simulate_p2p_sharing(sample_portfolio)

print(f"Total Internal Fund: {results['fund_total_dzd']:,} DZD")
print(f"Contributors:        {results['contributing_wilayas']}")
print(f"Beneficiaries:       {results['beneficiary_wilayas']}")