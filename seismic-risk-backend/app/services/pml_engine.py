"""
Probable Maximum Loss (PML) Calculation Engine
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, Optional
from datetime import date
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.pml_simulation import PMLSimulation
from app.core.logging import logger


class PMLEngine:
    """Probable Maximum Loss calculation engine"""
    
    @classmethod
    def get_intensity_factor(cls, magnitude: float, rpa_zone: str) -> float:
        """Get intensity factor based on magnitude and zone"""
        zone_defaults = {"0": 0.05, "I": 0.10, "IIa": 0.15, "IIb": 0.20, "III": 0.30}
        base_factor = zone_defaults.get(rpa_zone, 0.15)
        return base_factor * (magnitude / 6.0)
    
    @classmethod
    def get_retention_capacity(cls, db: Session) -> float:
        """Get current retention capacity"""
        from app.models.retention_config import RetentionConfig
        config = db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "GLOBAL_RETENTION_CAPACITY"
        ).order_by(RetentionConfig.effective_from.desc()).first()
        return float(config.config_value) if config else 1_000_000_000
    
    @classmethod
    def get_reinsurance_ratio(cls, db: Session) -> float:
        """Get current reinsurance coverage ratio"""
        from app.models.retention_config import RetentionConfig
        config = db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "REINSURANCE_COVERAGE_RATIO"
        ).order_by(RetentionConfig.effective_from.desc()).first()
        return float(config.config_value) if config else 0.40
    
    @classmethod
    def calculate_pml(
        cls,
        db: Session,
        wilaya_id: int,
        magnitude: float,
        scenario_month: Optional[date] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        
        try:
            wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
            if not wilaya:
                raise ValueError(f"Wilaya {wilaya_id} not found")
            
            contracts = db.query(Contract).filter(
                Contract.wilaya_id == wilaya_id,
                Contract.is_active == True
            ).all()
            
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
                    "intensity_factor_used": cls.get_intensity_factor(magnitude, wilaya.rpa_zone),
                    "simulation_id": 0
                }
            
            total_capital = sum(float(c.capital_assure) for c in contracts)
            intensity_factor = cls.get_intensity_factor(magnitude, wilaya.rpa_zone)
            
            expected_loss = 0
            for contract in contracts:
                building_type = db.query(BuildingType).filter(
                    BuildingType.id == contract.building_type_id
                ).first()
                vuln_factor = float(building_type.vulnerability_factor) if building_type else 0.5
                contract_loss = float(contract.capital_assure) * vuln_factor * intensity_factor
                expected_loss += contract_loss
            
            reinsurance_ratio = cls.get_reinsurance_ratio(db)
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
                "intensity_factor_used": intensity_factor,
                "simulation_id": 0
            }
            
            return result
            
        except Exception as e:
            logger.error(f"PML calculation error: {e}")
            return {
                "wilaya_id": wilaya_id,
                "wilaya_name": "Unknown",
                "magnitude": magnitude,
                "total_capital_dzd": 0,
                "contract_count": 0,
                "expected_loss_dzd": 0,
                "reinsurance_cover_dzd": 0,
                "net_company_loss_dzd": 0,
                "loss_ratio_pct": 0,
                "intensity_factor_used": 0,
                "simulation_id": 0,
                "error": str(e)
            }
