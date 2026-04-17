from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class UnderwritingDecision(Base):
    __tablename__ = "underwriting_decisions"
    
    id = Column(Integer, primary_key=True)
    numero_police_input = Column(String(50), nullable=False)
    wilaya_id = Column(Integer, ForeignKey("wilayas.id"))
    building_type_id = Column(Integer, ForeignKey("building_types.id"))
    code_sous_branche = Column(String(20))
    capital_proposed_dzd = Column(Numeric(18, 2), nullable=False)
    decision = Column(String(30), nullable=False)
    reason_fr = Column(Text)
    conditions_json = Column(JSON)
    risk_score_at_decision = Column(Numeric(5, 1))
    remaining_capacity_dzd = Column(Numeric(18, 2))
    ai_narrative = Column(Text)
    decided_by_user_id = Column(Integer, ForeignKey("users.id"))
    decided_at = Column(DateTime(timezone=True), default=func.now())
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    
    # Relationships
    contract = relationship("Contract", back_populates="underwriting_decisions")