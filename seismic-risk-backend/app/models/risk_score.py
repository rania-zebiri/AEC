from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), unique=True, nullable=False)
    risk_score = Column(Numeric(5, 1), nullable=False)
    risk_level = Column(String(10), nullable=False)
    zone_score_component = Column(Numeric(5, 2))
    vuln_component = Column(Numeric(5, 2))
    capital_component = Column(Numeric(5, 2))
    computed_at = Column(DateTime(timezone=True), default=func.now())
    
    # Relationships
    contract = relationship("Contract", back_populates="risk_score")