import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from interface.ai_interface import SeismicAI

# 1. Setup a Mock Portfolio
portfolio = [
    {"wilaya": "Alger", "capital": 900_000_000},
    {"wilaya": "Blida", "capital": 800_000_000},
    {"wilaya": "Adrar", "capital": 200_000_000}
]

print("🚀 RUNNING FINAL SYSTEM INTEGRATION TEST...")

# 2. Run Portfolio Analysis
analysis = SeismicAI.get_portfolio_analysis(portfolio)
print(f"\n✅ Portfolio Balance: {analysis['balance_index']}/100")
print(f"✅ Hotspots Found: {len(analysis['hotspots'])}")

# 3. Test a Pricing Strategy
pricing = SeismicAI.get_market_strategy("Alger", 45000)
print(f"✅ Strategy for Alger: {pricing['strategy']}")

print("\n🤖 AI SUMMARY PREVIEW:")
print(analysis['ai_executive_summary'][:200] + "...")