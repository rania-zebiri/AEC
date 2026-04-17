"""
Peer-to-Peer Risk Sharing Simulator
"""
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.services.pml_engine import PMLEngine


class P2PSimulator:
    """
    Simulates peer-to-peer risk sharing among contracts
    """
    
    @classmethod
    def simulate_pool(
        cls,
        db: Session,
        contract_ids: List[int],
        pool_size: int = 100
    ) -> Dict[str, Any]:
        """
        Simulate a P2P risk pool for selected contracts
        
        Args:
            contract_ids: List of contract IDs to include in pool
            pool_size: Number of contracts to simulate in pool
            
        Returns:
            Simulation results including diversification benefits
        """
        
        # Get contracts
        contracts = db.query(Contract).filter(
            Contract.id.in_(contract_ids[:pool_size]),
            Contract.is_active == True
        ).all()
        
        if not contracts:
            return {"error": "No contracts found for simulation"}
        
        # Calculate total exposure
        total_exposure = sum(float(c.capital_assure) for c in contracts)
        
        # Calculate weighted average risk score
        from app.models.risk_score import RiskScore
        risk_scores = {}
        for contract in contracts:
            score = db.query(RiskScore).filter(
                RiskScore.contract_id == contract.id
            ).first()
            if score:
                risk_scores[contract.id] = float(score.risk_score)
        
        avg_risk_score = sum(risk_scores.values()) / len(risk_scores) if risk_scores else 50
        
        # Calculate diversification benefit
        # Group by wilaya to assess concentration
        wilaya_groups = {}
        for contract in contracts:
            if contract.wilaya_id not in wilaya_groups:
                wilaya_groups[contract.wilaya_id] = []
            wilaya_groups[contract.wilaya_id].append(contract)
        
        # Calculate Herfindahl index for the pool
        wilaya_exposures = [
            sum(float(c.capital_assure) for c in group)
            for group in wilaya_groups.values()
        ]
        
        from app.services.balance_index import BalanceIndexCalculator
        balance_index = BalanceIndexCalculator.calculate(wilaya_exposures)
        
        # Calculate diversification factor (lower concentration = better diversification)
        diversification_factor = balance_index / 100
        
        # Estimate risk reduction
        risk_reduction_pct = (1 - diversification_factor) * 30  # Max 30% reduction
        
        return {
            "pool_size": len(contracts),
            "total_exposure_dzd": total_exposure,
            "average_risk_score": round(avg_risk_score, 1),
            "balance_index": round(balance_index, 1),
            "diversification_factor": round(diversification_factor, 3),
            "estimated_risk_reduction_pct": round(risk_reduction_pct, 1),
            "wilaya_diversity": len(wilaya_groups),
            "recommendation": "Pool is well diversified" if balance_index > 60 else "Consider adding more geographic diversity"
        }
    
    @classmethod
    def compare_scenarios(
        cls,
        db: Session,
        scenario_name: str,
        contract_ids: List[int]
    ) -> Dict[str, Any]:
        """
        Compare different P2P pooling scenarios
        """
        
        # Baseline: individual risk (no pooling)
        individual_risk = 0
        for contract_id in contract_ids[:50]:
            contract = db.query(Contract).filter(Contract.id == contract_id).first()
            if contract:
                wilaya = db.query(Wilaya).filter(Wilaya.id == contract.wilaya_id).first()
                if wilaya:
                    intensity = PMLEngine.get_intensity_factor(6.5, wilaya.rpa_zone)
                    from app.models.building_type import BuildingType
                    building = db.query(BuildingType).filter(
                        BuildingType.id == contract.building_type_id
                    ).first()
                    vuln = float(building.vulnerability_factor) if building else 0.5
                    individual_risk += float(contract.capital_assure) * vuln * intensity
        
        # Pooled scenario
        pooled = cls.simulate_pool(db, contract_ids, 50)
        
        return {
            "scenario_name": scenario_name,
            "individual_risk_dzd": round(individual_risk, 2),
            "pooled_risk_dzd": pooled.get("total_exposure_dzd", 0),
            "risk_reduction_dzd": round(individual_risk - pooled.get("total_exposure_dzd", 0), 2),
            "risk_reduction_pct": round((1 - pooled.get("total_exposure_dzd", 0) / individual_risk) * 100, 1) if individual_risk > 0 else 0,
            "diversification_benefit": pooled.get("estimated_risk_reduction_pct", 0),
            "recommendation": pooled.get("recommendation", "")
        }