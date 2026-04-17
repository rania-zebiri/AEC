import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.risk_scorer import calculate_contract_score

# Client A: Modern building in a safe zone
client_a = calculate_contract_score("Adrar", "Acier", 500_000_000)

# Client B: Old masonry building in Algiers
client_b = calculate_contract_score("Alger", "Pierre", 500_000_000)

print("--- Testing Risk Scoring Engine ---")
print(f"Client A (Adrar/Steel):   Score {client_a['score']} - {client_a['label']}")
print(f"Client B (Alger/Stone):   Score {client_b['score']} - {client_b['label']}")