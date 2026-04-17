from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, Optional
import math
from datetime import date
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.pml_simulation import PMLSimulation
from app.core.logging import logger

class PMLEngine:
    """Probable Maximum Loss calculation engine"""
    
    # Intensity factor matrix based on RPA zone and magnitude
    # Format: (magnitude, zone) -> intensity_factor
    INTENSITY_MATRIX = {
        # Magnitude 5.0
        (5.0, "0"): 0.01, (5.0, "I"): 0.02, (5.0, "IIa"): 0.03,
        (5.0, "IIb"): 0.04, (5.0, "III"): 0.06,
        # Magnitude 5.5
        (5.5, "0"): 0.02, (5.5, "I"): 0.04, (5.5, "IIa"): 0.06,
        (5.5, "IIb"): 0.08, (5.5, "III"): 0.12,
        # Magnitude 6.0
        (6.0, "0"): 0.05, (6.0, "I"): 0.08, (6.0, "IIa"): 0.12,
        (6.0, "IIb"): 0.16, (6.0, "III"): 0.24,
        # Magnitude 6.5
        (6.5, "0"): 0.08, (6.5, "I"): 0.15, (6.5, "IIa"): 0.25,
        (6.5, "IIb"): 0.35, (6.5, "III"): 0.50,
        # Magnitude 7.0
        (7.0, "0"): 0.15, (7.0, "I"): 0.25, (7.0, "IIa"): 0.40,
        (7.0, "IIb"): 0.55, (7.0, "III"): 0.75,
        # Magnitude 7.5
        (7.5, "0"): 0.25, (7.5, "I"): 0.40, (7.5, "IIa"): 0.60,
        (7.5, "IIb"): 0.75, (7.5, "III"): 0.90,
    }
    
    @classmethod
    def get_intensity_factor(cls, magnitude: float, rpa_zone: str) -> float:
        """Get intensity factor from matrix, interpolating if needed"""
        # Round magnitude to nearest 0.5
        rounded_mag = round(magnitude * 2) / 2
        rounded_mag = max(5.0, min(7.5, rounded_mag))
        
        key = (rounded_mag, rpa_zone)
        if key in cls.INTENSITY_MATRIX:
            return cls.INTENSITY_MATRIX[key]
        
        # Default fallback
        zone_defaults = {"0": 0.05, "I": 0.10, "IIa": 0.15, "IIb": 0.20, "III": 0.30}
        return zone_defaults.get(rpa_zone, 0.15) * (magnitude / 6.0)
    
    @classmethod
    def calculate_pml(
        cls,
        db: Session,
        wilaya_id: int,
        magnitude: float,
        scenario_month: Optional[date] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Calculate PML for a given wilaya and magnitude"""
        
        # Get wilaya info
        wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
        if not wilaya:
            raise ValueError(f"Wilaya {wilaya_id} not found")
        
        # Get active contracts in this wilaya
        contracts_query = db.query(Contract).filter(
            Contract.wilaya_id == wilaya_id,
            Contract.is_active == True
        )
        
        # If scenario month provided, filter by contracts active at that time
        if scenario_month:
            contracts_query = contracts_query.filter(
                Contract.date_effect <= scenario_month,
                Contract.date_expiration >= scenario_month
            )
        
        contracts = contracts_query.all()
        
        if not contracts:
            return {
                "wilaya_id": wilaya_id,
                "wilaya_name": wilaya.name_fr,
                "magnitude": magnitude,
                "total_capital_dzd": 0,
                "contract_count": 0,
                "expected_loss_dzd": 0,
                "reinsurance_cover_dzd": 0,
                "net_company_loss_dzd": 0,
                "loss_ratio_pct": 0,
                "intensity_factor_used": 0
            }
        
        # Sum total capital
        total_capital = sum(float(c.capital_assure) for c in contracts)
        
        # Get intensity factor
        intensity_factor = cls.get_intensity_factor(magnitude, wilaya.rpa_zone)
        
        # Calculate expected loss for each contract based on vulnerability
        expected_loss = 0
        for contract in contracts:
            building_type = db.query(BuildingType).filter(
                BuildingType.id == contract.building_type_id
            ).first()
            vuln_factor = float(building_type.vulnerability_factor) if building_type else 0.5
            contract_loss = float(contract.capital_assure) * vuln_factor * intensity_factor
            expected_loss += contract_loss
        
        # Get reinsurance configuration
        from app.services.underwriting import UnderwritingEngine
        retention_capacity = UnderwritingEngine.get_retention_capacity(db)
        reinsurance_ratio = UnderwritingEngine.get_reinsurance_ratio(db)
        
        # Calculate net loss
        reinsurance_cover = expected_loss * reinsurance_ratio
        net_loss = expected_loss - reinsurance_cover
        loss_ratio = (expected_loss / total_capital * 100) if total_capital > 0 else 0
        
        result = {
            "wilaya_id": wilaya_id,
            "wilaya_name": wilaya.name_fr,
            "magnitude": magnitude,
            "total_capital_dzd": round(total_capital, 2),
            "contract_count": len(contracts),
            "expected_loss_dzd": round(expected_loss, 2),
            "reinsurance_cover_dzd": round(reinsurance_cover, 2),
            "net_company_loss_dzd": round(net_loss, 2),
            "loss_ratio_pct": round(loss_ratio, 2),
            "intensity_factor_used": intensity_factor
        }
        
        # Save to database
        simulation = PMLSimulation(
            wilaya_id=wilaya_id,
            magnitude=magnitude,
            scenario_month=scenario_month or date.today(),
            total_capital_dzd=result["total_capital_dzd"],
            contract_count=result["contract_count"],
            expected_loss_dzd=result["expected_loss_dzd"],
            reinsurance_cover_dzd=result["reinsurance_cover_dzd"],
            net_company_loss_dzd=result["net_company_loss_dzd"],
            loss_ratio_pct=result["loss_ratio_pct"],
            intensity_factor_used=intensity_factor,
            simulated_by_user_id=user_id
        )
        db.add(simulation)
        db.commit()
        db.refresh(simulation)
        
        result["simulation_id"] = simulation.id
        return result