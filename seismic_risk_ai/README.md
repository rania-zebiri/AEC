# Seismic Risk AI - Core Logic Module

This module provides the intelligence for the GAM Seismic Risk platform. 
It handles seismic zoning (RPA 99), financial loss estimation (PML), 
risk scoring, and automated strategic reporting.

## 🚀 Installation
1. Install dependencies: `pip install -r requirements.txt`
2. Add your `GROQ_API_KEY` to a `.env` file in the root directory.

## 🛠 Usage for Backend (P2)
All AI features are centralized in the `SeismicAI` class.

```python
from seismic_risk_ai.interface.ai_interface import SeismicAI

# 1. Analyze entire portfolio
analysis = SeismicAI.get_portfolio_analysis(portfolio_list)
print(analysis['ai_executive_summary']) # French report

# 2. Evaluate a new contract
decision = SeismicAI.evaluate_new_contract(new_contract, current_portfolio)

# 3. Simulate Earthquake Loss
pml = SeismicAI.simulate_disaster(capital=1000000, structure="BETON", magnitude=7.2)