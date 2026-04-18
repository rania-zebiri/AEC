from seismic_risk_ai.core.rpa_zones import get_zone_by_location 
from seismic_risk_ai.core.analytics.pml_engine import calculate_pml
from seismic_risk_ai.core.risk_scorer import calculate_contract_score
from seismic_risk_ai.core.analytics.hotspot_detector import detect_hotspots
from seismic_risk_ai.core.underwriting import decide_underwriting
from seismic_risk_ai.core.analytics.balance_index import calculate_portfolio_balance
from seismic_risk_ai.core.analytics.elasticity import get_pricing_advice
from seismic_risk_ai.core.analytics.p2p_simulator import simulate_p2p_sharing
from seismic_risk_ai.services.llm_service import generate_strategic_report
from seismic_risk_ai.core.analytics.pml_engine import calculate_pml
from seismic_risk_ai.services.report_generator import generate_acaps_csv

class SeismicAI:
    @staticmethod
    def get_portfolio_analysis(portfolio_data):
        # On utilise get_zone_by_location au lieu de get_zone_by_wilaya si nécessaire
        balance_score = calculate_portfolio_balance(portfolio_data)
        hotspots = detect_hotspots(portfolio_data)
        p2p_stats = simulate_p2p_sharing(portfolio_data)
        report = generate_strategic_report(balance_score, hotspots)
        
        return {
            "balance_index": balance_score,
            "hotspots": hotspots,
            "p2p_fund": p2p_stats,
            "ai_executive_summary": report
        }

    @staticmethod
    def evaluate_new_contract(contract, current_portfolio=None):
        return decide_underwriting(contract, current_portfolio)

    @staticmethod
    def get_market_strategy(wilaya, current_premium):
        return get_pricing_advice(wilaya, current_premium)

    @staticmethod
    def simulate_disaster(capital, structure, magnitude):
        return calculate_pml(capital, structure, magnitude)
    
    @staticmethod
    def export_regulatory_report(portfolio_data):
        """Génère le fichier CSV pour les autorités."""
        return generate_acaps_csv(portfolio_data)