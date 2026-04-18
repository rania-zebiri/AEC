# app/services/ai_integration.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime
import pandas as pd
import json

# Importer les modules AI
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai'))

from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore
from app.models.hotspot_snapshot import HotspotSnapshot
from app.models.retention_config import RetentionConfig


class AIIntegrationService:
    """Service d'intégration des fonctionnalités AI"""
    
    @staticmethod
    def get_portfolio_data(db: Session) -> List[Dict]:
        """Récupère les données du portefeuille pour l'IA"""
        
        contracts = db.query(
            Contract.id,
            Contract.numero_police,
            Contract.code_sous_branche,
            Contract.capital_assure,
            Contract.date_effect,
            Wilaya.name_fr.label("wilaya"),
            Wilaya.rpa_zone,
            BuildingType.label_fr.label("building_type"),
            BuildingType.vulnerability_factor,
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
                "structure": c.building_type or "INCONNU",
                "zone": c.rpa_zone,
                "vulnerability": float(c.vulnerability_factor) if c.vulnerability_factor else 0.5,
                "risk_score": float(c.risk_score) if c.risk_score else 50,
                "code_sous_branche": c.code_sous_branche
            })
        
        return portfolio
    
    @staticmethod
    def calculate_balance_index(portfolio_data: List[Dict]) -> float:
        """Calcule l'indice d'équilibre du portefeuille"""
        
        if not portfolio_data:
            return 100.0
        
        total_capital = sum(c['capital'] for c in portfolio_data)
        capital_in_high_risk = sum(c['capital'] for c in portfolio_data if c.get('zone') == 'III')
        
        if total_capital == 0:
            return 100.0
        
        high_risk_ratio = capital_in_high_risk / total_capital
        balance_score = (1 - high_risk_ratio) * 100
        
        return round(balance_score, 2)
    
    @staticmethod
    def detect_hotspots(portfolio_data: List[Dict], capacity_per_wilaya: float = 1_000_000_000) -> List[Dict]:
        """Détecte les hotspots de concentration"""
        
        # Agréger par wilaya
        wilaya_totals = {}
        for contract in portfolio_data:
            wilaya = contract['wilaya']
            wilaya_totals[wilaya] = wilaya_totals.get(wilaya, 0) + contract['capital']
        
        hotspots = []
        for wilaya, total in wilaya_totals.items():
            if total > capacity_per_wilaya:
                excess = total - capacity_per_wilaya
                percentage_over = (excess / capacity_per_wilaya) * 100
                hotspots.append({
                    "wilaya": wilaya,
                    "total_exposure": round(total, 2),
                    "excess": round(excess, 2),
                    "severity": "CRITICAL" if percentage_over > 50 else "WARNING",
                    "percentage_over": round(percentage_over, 1)
                })
        
        return hotspots
    
    @staticmethod
    def get_pricing_advice(wilaya: str, current_premium: float, zone: str = None) -> Dict:
        """Donne des conseils de tarification basés sur la zone sismique"""
        
        if zone == "III":
            suggested_change = 0.15
            strategy = "Surcharge de sécurité (Zone à haut risque)"
            elasticity_label = "Faible (Inélastique)"
        elif zone in ["IIa", "IIb"]:
            suggested_change = 0.05
            strategy = "Ajustement modéré"
            elasticity_label = "Moyenne"
        elif zone == "0":
            suggested_change = -0.10
            strategy = "Offensive commercial (Zone sécurisée)"
            elasticity_label = "Forte (Élastique)"
        else:
            suggested_change = 0.0
            strategy = "Maintenir le tarif actuel"
            elasticity_label = "Inconnue"
        
        new_premium = current_premium * (1 + suggested_change)
        
        return {
            "wilaya": wilaya,
            "zone": zone,
            "recommended_premium": round(new_premium, 2),
            "change_percent": f"{suggested_change * 100}%",
            "strategy": strategy,
            "elasticity": elasticity_label
        }
    
    @staticmethod
    def get_vulnerability_factor(structure_type: str) -> float:
        """Retourne le facteur de vulnérabilité selon le type de bâtiment"""
        
        VULNERABILITY_FACTORS = {
            "ACIER": 0.15,
            "BETON ARME": 0.25,
            "MACONNERIE CHAINEE": 0.45,
            "MACONNERIE ORDINAIRE": 0.75,
            "CONSTRUCTION PRECAIRE": 0.90,
            "INCONNU": 0.50
        }
        
        if not structure_type:
            return VULNERABILITY_FACTORS["INCONNU"]
        
        structure_upper = structure_type.upper()
        
        if "BETON" in structure_upper:
            return VULNERABILITY_FACTORS["BETON ARME"]
        if "METAL" in structure_upper or "STEEL" in structure_upper:
            return VULNERABILITY_FACTORS["ACIER"]
        if "PIERRE" in structure_upper:
            return VULNERABILITY_FACTORS["MACONNERIE ORDINAIRE"]
        
        return VULNERABILITY_FACTORS.get(structure_upper, VULNERABILITY_FACTORS["INCONNU"])
    
    @staticmethod
    def calculate_pml(capital: float, structure_type: str, magnitude: float, retention_rate: float = 0.2) -> Dict:
        """Calcule la perte maximale probable (PML)"""
        
        vuln_factor = AIIntegrationService.get_vulnerability_factor(structure_type)
        intensity_factor = min(1.0, (magnitude / 7.5) ** 2.5)
        
        total_loss = capital * vuln_factor * intensity_factor
        net_loss = total_loss * retention_rate
        reinsurer_share = total_loss - net_loss
        
        return {
            "total_loss": round(total_loss, 2),
            "net_loss": round(net_loss, 2),
            "reinsurer_share": round(reinsurer_share, 2),
            "vulnerability_factor": vuln_factor,
            "intensity_factor": round(intensity_factor, 4)
        }
    
    @staticmethod
    def get_zone_by_location(wilaya_name: str, commune: str = None) -> str:
        """Retourne la zone RPA selon la wilaya et la commune"""
        
        rpa_map = {
            "ADRAR": "0", "BECHAR": "0", "TAMANRASSET": "0", "OUARGLA": "0",
            "ILLIZI": "0", "TINDOUF": "0", "EL OUED": "0", "GHARDAIA": "0",
            "LAGHOUAT": "I", "OUM EL BOUAGHI": "I", "BATNA": "I", "BISKRA": "I",
            "TEBESSA": "I", "TLEMCEN": "I", "TIARET": "I", "DJELFA": "I",
            "SAIDA": "I", "SIDI BEL ABBES": "I", "EL BAYADH": "I", "KHENCHELA": "I",
            "SOUK AHRAS": "I", "NAAMA": "I", "ALGER": "III", "TIPAZA": "III",
            "BOUMERDES": "III", "CHLEF": "III", "BLIDA": "III", "MEDEA": "IIb",
            "MOSTAGANEM": "IIa", "RELIZANE": "IIa", "MASCARA": "IIa",
            "TIZI OUZOU": "IIa", "M'SILA": "I", "AIN DEFLA": "IIa"
        }
        
        w = wilaya_name.strip().upper() if wilaya_name else ""
        return rpa_map.get(w, "I")