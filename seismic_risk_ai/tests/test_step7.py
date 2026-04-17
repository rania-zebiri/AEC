import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.balance_index import calculate_portfolio_balance

# Portfolio 1: Very dangerous (100% in Algiers - Zone III)
bad_portfolio = [
    {"wilaya": "Alger", "capital": 1_000_000_000}
]

# Portfolio 2: Balanced (500M in Algiers, 500M in Adrar - Zone 0)
good_portfolio = [
    {"wilaya": "Alger", "capital": 500_000_000},
    {"wilaya": "Adrar", "capital": 500_000_000}
]

print("--- Testing Portfolio Balance Index ---")
score_bad = calculate_portfolio_balance(bad_portfolio)
score_good = calculate_portfolio_balance(good_portfolio)

print(f"Portfolio 1 (Unbalanced): Score {score_bad}/100")
print(f"Portfolio 2 (Balanced):   Score {score_good}/100")