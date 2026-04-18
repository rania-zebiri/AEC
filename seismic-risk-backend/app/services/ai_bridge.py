# app/services/ai_bridge.py
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime

# Ajouter le chemin des scripts AI
sys.path.insert(0, '/Users/macbook/AEC-ai_logic')

# Importer les modules AI
from seismic_risk_ai.core.rpa_zones import get_zone_by_location, get_risk_level_description
from seismic_risk_ai.core.vulnerability import get_vulnerability_factor, get_vulnerability_label
from seismic_risk_ai.core.analytics.balance_index import calculate_portfolio_balance
from seismic_risk_ai.core.analytics.hotspot_detector import detect_hotspots
from seismic_risk_ai.core.analytics.elasticity import get_pricing_advice
from seismic_risk_ai.core.analytics.p2p_simulator import simulate_p2p_sharing
from seismic_risk_ai.core.underwriting import decide_underwriting
from seismic_risk_ai.services.llm_service import generate_strategic_report

from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore


class AIBridgeService:
    """Pont entre la base de données et les scripts AI"""
    
    @staticmethod
    def get_portfolio_for_ai(db: Session) -> List[Dict]:
        """Récupère les données du portefeuille au format attendu par l'IA"""
        
        contracts = db.query(
            Contract.id,
            Contract.numero_police,
            Contract.capital_assure,
            Wilaya.name_fr.label("wilaya"),
            BuildingType.label_fr.label("structure"),
            RiskScore.risk_score
        ).join(
            Wilaya, Contract.wilaya_id == Wilaya.id
        ).outerjoin(
            BuildingType, Contract.building_type_id == BuildingType.id
        ).outerjoin(
            RiskScore, Contract.id == RiskScore.contract_id
        ).filter(
            Contract.is_active == True
        ).all()
        
        portfolio = []
        for c in contracts:
            portfolio.append({
                "id": c.numero_police,
                "wilaya": c.wilaya,
                "capital": float(c.capital_assure) if c.capital_assure else 0,
                "structure": c.structure or "INCONNU",
                "risk_score": float(c.risk_score) if c.risk_score else 50
            })
        
        return portfolio
    
    @staticmethod
    def get_portfolio_analysis(db: Session) -> Dict:
        """Analyse complète du portefeuille avec IA"""
        
        portfolio_data = AIBridgeService.get_portfolio_for_ai(db)
        
        # Calculer l'indice d'équilibre
        balance_score = calculate_portfolio_balance(portfolio_data)
        
        # Détecter les hotspots
        hotspots = detect_hotspots(portfolio_data)
        
        # Simuler le P2P
        p2p_stats = simulate_p2p_sharing(portfolio_data)
        
        # Générer un rapport stratégique
        hotspot_names = [h['wilaya'] for h in hotspots]
        report = generate_strategic_report(balance_score, hotspot_names)
        
        return {
            "balance_index": balance_score,
            "hotspots": hotspots,
            "p2p_fund": p2p_stats,
            "ai_executive_summary": report,
            "total_contracts": len(portfolio_data),
            "total_exposure_dzd": sum(c['capital'] for c in portfolio_data),
            "analysis_date": datetime.now().isoformat()
        }
    
    @staticmethod
    def evaluate_contract(db: Session, contract_data: Dict) -> Dict:
        """Évalue un contrat avec les règles IA"""
        
        # Récupérer la zone
        zone = get_zone_by_location(contract_data.get('wilaya'), contract_data.get('commune'))
        
        # Structure pour l'IA
        ai_contract = {
            "wilaya": contract_data.get('wilaya'),
            "commune": contract_data.get('commune'),
            "floors": contract_data.get('floors', 1),
            "height": contract_data.get('height', 3),
            "capital": contract_data.get('capital', 1000000),
            "structure": contract_data.get('structure', 'INCONNU')
        }
        
        # Décision IA
        result = decide_underwriting(ai_contract)
        
        return result
    
    @staticmethod
    def get_pricing_strategy(wilaya_name: str, current_premium: float) -> Dict:
        """Stratégie de tarification IA"""
        
        zone = get_zone_by_location(wilaya_name)
        advice = get_pricing_advice(wilaya_name, current_premium)
        
        return advice
    
    @staticmethod
    def get_vulnerability_analysis(structure_type: str) -> Dict:
        """Analyse de vulnérabilité"""
        
        factor = get_vulnerability_factor(structure_type)
        label = get_vulnerability_label(factor)
        
        return {
            "structure_type": structure_type,
            "vulnerability_factor": factor,
            "vulnerability_label": label,
            "description": "Très Résistant" if factor <= 0.2 else 
                          "Résistant" if factor <= 0.4 else 
                          "Modéré" if factor <= 0.6 else 
                          "Fragile"
        }