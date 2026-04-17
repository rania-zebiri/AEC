"""
Elasticity Calculations for What-If Scenarios
"""
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.services.pml_engine import PMLEngine
from app.services.balance_index import BalanceIndexCalculator


class ElasticityCalculator:
    """
    Calculates portfolio elasticity for what-if scenarios
    Measures how changes affect PML and balance index
    """
    
    @classmethod
    def calculate_pml_elasticity(
        cls,
        db: Session,
        baseline_pml: float,
        new_contracts: List[Dict[str, Any]],
        removed_contract_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Calculate how PML changes with portfolio modifications
        """
        
        # Calculate new PML after changes
        new_pml = baseline_pml
        
        # Add new contracts
        for contract_data in new_contracts:
            wilaya_id = contract_data.get("wilaya_id")
            capital = contract_data.get("capital_assure_dzd", 0)
            building_type_id = contract_data.get("building_type_id")
            
            # Get vulnerability factor
            from app.models.building_type import BuildingType
            building_type = db.query(BuildingType).filter(
                BuildingType.id == building_type_id
            ).first()
            vuln_factor = float(building_type.vulnerability_factor) if building_type else 0.5
            
            # Get wilaya zone score
            wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
            zone_score = float(wilaya.zone_score) if wilaya else 1.0
            
            # Approximate contribution to PML for magnitude 6.5
            intensity_factor = PMLEngine.get_intensity_factor(6.5, wilaya.rpa_zone if wilaya else "I")
            contract_pml = capital * vuln_factor * intensity_factor
            new_pml += contract_pml
        
        # Remove contracts
        if removed_contract_ids:
            removed_contracts = db.query(Contract).filter(
                Contract.id.in_(removed_contract_ids)
            ).all()
            
            for contract in removed_contracts:
                building_type = db.query(BuildingType).filter(
                    BuildingType.id == contract.building_type_id
                ).first()
                vuln_factor = float(building_type.vulnerability_factor) if building_type else 0.5
                
                wilaya = db.query(Wilaya).filter(Wilaya.id == contract.wilaya_id).first()
                intensity_factor = PMLEngine.get_intensity_factor(6.5, wilaya.rpa_zone if wilaya else "I")
                contract_pml = float(contract.capital_assure) * vuln_factor * intensity_factor
                new_pml -= contract_pml
        
        pml_change = new_pml - baseline_pml
        pml_change_pct = (pml_change / baseline_pml * 100) if baseline_pml > 0 else 0
        
        return {
            "baseline_pml_dzd": baseline_pml,
            "new_pml_dzd": new_pml,
            "absolute_change_dzd": pml_change,
            "percentage_change": round(pml_change_pct, 2),
            "elasticity_coefficient": round(pml_change_pct / 100, 3)  # Simplified elasticity
        }
    
    @classmethod
    def calculate_balance_elasticity(
        cls,
        db: Session,
        baseline_balance: float,
        new_contracts: List[Dict[str, Any]],
        removed_contract_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Calculate how balance index changes with portfolio modifications
        """
        
        # Get current exposures per wilaya
        from sqlalchemy import func
        exposures = {}
        
        results = db.query(
            Contract.wilaya_id,
            func.sum(Contract.capital_assure).label("total_capital")
        ).filter(Contract.is_active == True).group_by(Contract.wilaya_id).all()
        
        for r in results:
            exposures[r.wilaya_id] = float(r.total_capital)
        
        # Add new contracts
        for contract_data in new_contracts:
            wilaya_id = contract_data.get("wilaya_id")
            capital = contract_data.get("capital_assure_dzd", 0)
            exposures[wilaya_id] = exposures.get(wilaya_id, 0) + capital
        
        # Remove contracts
        if removed_contract_ids:
            removed_contracts = db.query(Contract).filter(
                Contract.id.in_(removed_contract_ids)
            ).all()
            for contract in removed_contracts:
                exposures[contract.wilaya_id] = exposures.get(contract.wilaya_id, 0) - float(contract.capital_assure)
        
        # Calculate new balance index
        new_balance = BalanceIndexCalculator.calculate(list(exposures.values()))
        
        balance_change = new_balance - baseline_balance
        
        return {
            "baseline_balance_index": round(baseline_balance, 1),
            "new_balance_index": round(new_balance, 1),
            "absolute_change": round(balance_change, 1),
            "improvement": balance_change > 0,
            "elasticity": round(balance_change / 10, 2)  # Normalized elasticity
        }