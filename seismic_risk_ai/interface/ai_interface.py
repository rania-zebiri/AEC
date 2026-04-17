# seismic_risk_ai/interface/ai_interface.py

from core.rpa_zones import get_zone_by_wilaya, get_risk_level_description
from core.pml_engine import calculate_pml
from core.risk_scorer import calculate_contract_score
from core.hotspot_detector import detect_hotspots
from core.underwriting import decide_underwriting
from core.balance_index import calculate_portfolio_balance
from core.elasticity import get_pricing_advice
from core.p2p_simulator import simulate_p2p_sharing
from services.llm_service import generate_strategic_report

class SeismicAI:
    """
    THE MASTER INTERFACE.
    P2 (Backend) will use this class to get all AI insights.
    """
    
    @staticmethod
    def get_portfolio_analysis(portfolio_data):
        """Returns a full health check of the company."""
        balance_score = calculate_portfolio_balance(portfolio_data)
        hotspots = detect_hotspots(portfolio_data)
        p2p_stats = simulate_p2p_sharing(portfolio_data)
        
        # Call the LLM for the professional note
        report = generate_strategic_report(balance_score, hotspots)
        
        return {
            "balance_index": balance_score,
            "hotspots": hotspots,
            "p2p_fund": p2p_stats,
            "ai_executive_summary": report
        }

    @staticmethod
    def evaluate_new_contract(contract, current_portfolio):
        """Entry point for the Underwriting Assistant."""
        return decide_underwriting(contract, current_portfolio)

    @staticmethod
    def get_market_strategy(wilaya, current_premium):
        """Entry point for the Pricing Advisor."""
        return get_pricing_advice(wilaya, current_premium)

    @staticmethod
    def simulate_disaster(capital, structure, magnitude):
        """Entry point for the PML Simulator."""
        return calculate_pml(capital, structure, magnitude)