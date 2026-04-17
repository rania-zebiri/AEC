from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, Optional, Tuple
import json
from datetime import date
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.contract import Contract
from app.models.underwriting_decision import UnderwritingDecision
from app.models.retention_config import RetentionConfig
from app.services.risk_scorer import RiskScorer
from app.core.logging import logger

class UnderwritingEngine:
    """Underwriting decision engine with rule-based logic"""
    
    @classmethod
    def get_retention_capacity(cls, db: Session) -> float:
        """Get current global retention capacity per wilaya"""
        config = db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "GLOBAL_RETENTION_CAPACITY",
            RetentionConfig.effective_from <= date.today()
        ).order_by(RetentionConfig.effective_from.desc()).first()
        
        if config:
            return float(config.config_value)
        return 1_000_000_000  # Default 1B DZD
    
    @classmethod
    def get_reinsurance_ratio(cls, db: Session) -> float:
        """Get current reinsurance coverage ratio"""
        config = db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "REINSURANCE_COVERAGE_RATIO",
            RetentionConfig.effective_from <= date.today()
        ).order_by(RetentionConfig.effective_from.desc()).first()
        
        if config:
            return float(config.config_value)
        return 0.40  # Default 40%
    
    @classmethod
    def get_current_wilaya_exposure(cls, db: Session, wilaya_id: int) -> float:
        """Calculate current total active capital in a wilaya"""
        result = db.query(func.sum(Contract.capital_assure)).filter(
            Contract.wilaya_id == wilaya_id,
            Contract.is_active == True
        ).scalar()
        return float(result) if result else 0
    
    @classmethod
    def evaluate_contract(
        cls,
        db: Session,
        numero_police: str,
        wilaya_id: int,
        building_type_id: int,
        code_sous_branche: str,
        capital_proposed: float,
        date_effect: date,
        date_expiration: date,
        commune: str = "",
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluate a proposed contract and return underwriting decision"""
        
        # Get wilaya info
        wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
        if not wilaya:
            return {
                "decision": "REJECT",
                "reason_fr": "Wilaya non reconnue dans le système",
                "risk_score": None,
                "remaining_capacity": None,
                "conditions": None,
                "ai_narrative": None
            }
        
        # Get building type
        building_type = db.query(BuildingType).filter(BuildingType.id == building_type_id).first()
        
        # Check if policy number already exists
        existing = db.query(Contract).filter(Contract.numero_police == numero_police).first()
        if existing:
            return {
                "decision": "REJECT",
                "reason_fr": f"Numéro de police {numero_police} existe déjà dans le système",
                "risk_score": None,
                "remaining_capacity": None,
                "conditions": None,
                "ai_narrative": None
            }
        
        # Get current exposure and capacity
        current_exposure = cls.get_current_wilaya_exposure(db, wilaya_id)
        retention_capacity = cls.get_retention_capacity(db)
        remaining_capacity = retention_capacity - current_exposure
        
        # Calculate risk score for proposed contract
        # Create temporary contract object for scoring
        temp_contract = type('TempContract', (), {
            'wilaya_id': wilaya_id,
            'building_type_id': building_type_id,
            'capital_assure': capital_proposed
        })()
        score_data = RiskScorer.compute_score(db, temp_contract)
        
        # Decision logic
        decision = "ACCEPT"
        reason = ""
        conditions = None
        
        # Rule 1: Capacity check
        if capital_proposed > remaining_capacity:
            decision = "REJECT"
            reason = f"Capacité restante insuffisante dans la wilaya {wilaya.name_fr}. "
            reason += f"Capital proposé: {capital_proposed:,.0f} DZD, "
            reason += f"Capacité restante: {max(0, remaining_capacity):,.0f} DZD"
        elif capital_proposed > remaining_capacity * 0.8:
            decision = "ACCEPT_WITH_CONDITIONS"
            reason = f"Capital proposé proche de la capacité maximale de la wilaya "
            reason += f"({(capital_proposed/retention_capacity)*100:.1f}% de la capacité totale)."
            conditions = [
                "Prime majorée de 15%",
                "Inspection technique obligatoire",
                "Révision annuelle du contrat"
            ]
        # Rule 2: Risk score check
        elif score_data["risk_score"] >= 75:
            decision = "ACCEPT_WITH_CONDITIONS"
            reason = f"Score de risque élevé ({score_data['risk_score']:.1f}/100). "
            reason += f"Niveau {score_data['risk_level']}."
            conditions = [
                "Prime majorée de 25%",
                "Rapport d'inspection parasismique requis",
                "Déductible majoré"
            ]
        elif score_data["risk_score"] >= 50:
            decision = "ACCEPT_WITH_CONDITIONS"
            reason = f"Score de risque moyen-élevé ({score_data['risk_score']:.1f}/100)."
            conditions = [
                "Prime majorée de 10%",
                "Inspection facultative recommandée"
            ]
        # Rule 3: Zone check
        elif wilaya.zone_score >= 2.5:  # Zone III
            decision = "ACCEPT_WITH_CONDITIONS"
            reason = f"Zone sismique élevée (Zone {wilaya.rpa_zone}, score {wilaya.zone_score})."
            conditions = [
                "Clause spécifique zone sismique",
                "Renforcement parasismique recommandé"
            ]
        else:
            reason = f"Contrat acceptable selon les critères standards. "
            reason += f"Score de risque: {score_data['risk_score']:.1f}/100"
        
        # Save decision to database
        decision_record = UnderwritingDecision(
            numero_police_input=numero_police,
            wilaya_id=wilaya_id,
            building_type_id=building_type_id,
            code_sous_branche=code_sous_branche,
            capital_proposed_dzd=capital_proposed,
            decision=decision,
            reason_fr=reason,
            conditions_json=conditions,
            risk_score_at_decision=score_data["risk_score"],
            remaining_capacity_dzd=max(0, remaining_capacity),
            decided_by_user_id=user_id
        )
        db.add(decision_record)
        db.commit()
        db.refresh(decision_record)
        
        from app.core.logging import log_audit
        log_audit(
            db=db,
            user_id=user_id,
            action="UNDERWRITING_DECISION",
            entity_type="underwriting_decisions",
            entity_id=decision_record.id,
            details={
                "numero_police": numero_police,
                "wilaya": wilaya.name_fr,
                "decision": decision,
                "capital_proposed": capital_proposed,
                "risk_score": score_data["risk_score"]
            },
            ip_address=ip_address
        )
        
        return {
            "decision": decision,
            "reason_fr": reason,
            "risk_score": score_data["risk_score"],
            "risk_level": score_data["risk_level"],
            "remaining_capacity": max(0, remaining_capacity),
            "conditions": conditions,
            "decision_id": decision_record.id
        }