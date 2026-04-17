from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
import numpy as np
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore
from app.core.logging import logger

class RiskScorer:
    """Computes risk scores for contracts (0-100, higher = more dangerous)"""
    
    # Weight configuration
    ZONE_WEIGHT = 0.4
    VULN_WEIGHT = 0.3
    CAPITAL_WEIGHT = 0.3
    
    # Capital normalization: max capital in portfolio
    MAX_CAPITAL_REFERENCE = 1_000_000_000  # 1B DZD
    
    @classmethod
    def compute_score(cls, db: Session, contract: Contract) -> Dict[str, Any]:
        """Compute risk score for a single contract"""
        
        # Get wilaya zone score
        wilaya = db.query(Wilaya).filter(Wilaya.id == contract.wilaya_id).first()
        zone_score = float(wilaya.zone_score) if wilaya else 1.0
        normalized_zone = min(zone_score / 3.0, 1.0)  # Normalize to 0-1
        
        # Get vulnerability factor
        building_type = db.query(BuildingType).filter(
            BuildingType.id == contract.building_type_id
        ).first()
        vulnerability = float(building_type.vulnerability_factor) if building_type else 0.5
        
        # Normalize capital (log scale to handle wide range)
        capital = float(contract.capital_assure)
        normalized_capital = min(np.log10(capital + 1) / np.log10(cls.MAX_CAPITAL_REFERENCE + 1), 1.0)
        
        # Compute components (0-100 scale)
        zone_component = normalized_zone * 100
        vuln_component = vulnerability * 100
        capital_component = normalized_capital * 100
        
        # Weighted total
        total_score = (
            zone_component * cls.ZONE_WEIGHT +
            vuln_component * cls.VULN_WEIGHT +
            capital_component * cls.CAPITAL_WEIGHT
        )
        
        # Determine risk level
        if total_score >= 75:
            risk_level = "CRITICAL"
        elif total_score >= 50:
            risk_level = "HIGH"
        elif total_score >= 25:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            "risk_score": round(total_score, 1),
            "risk_level": risk_level,
            "zone_score_component": round(zone_component, 2),
            "vuln_component": round(vuln_component, 2),
            "capital_component": round(capital_component, 2)
        }
    
    @classmethod
    def compute_and_save(cls, db: Session, contract_id: int) -> RiskScore:
        """Compute and save risk score for a contract"""
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            raise ValueError(f"Contract {contract_id} not found")
        
        score_data = cls.compute_score(db, contract)
        
        # Upsert
        existing = db.query(RiskScore).filter(RiskScore.contract_id == contract_id).first()
        if existing:
            for key, value in score_data.items():
                setattr(existing, key, value)
            existing.computed_at = func.now()
            result = existing
        else:
            result = RiskScore(contract_id=contract_id, **score_data)
            db.add(result)
        
        db.commit()
        db.refresh(result)
        logger.info(f"Risk score computed for contract {contract.numero_police}: {result.risk_score}")
        return result
    
    @classmethod
    def compute_all_active(cls, db: Session) -> int:
        """Recompute scores for all active contracts"""
        contracts = db.query(Contract).filter(Contract.is_active == True).all()
        count = 0
        for contract in contracts:
            cls.compute_and_save(db, contract.id)
            count += 1
        logger.info(f"Recomputed risk scores for {count} active contracts")
        return count