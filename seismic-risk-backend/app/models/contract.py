from sqlalchemy import Column, Integer, String, Numeric, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(Integer, primary_key=True)
    numero_police = Column(String(50), unique=True, nullable=False)
    code_sous_branche = Column(String(20), nullable=False)
    num_avnt_cours = Column(String(20))
    date_effect = Column(Date, nullable=False)
    date_expiration = Column(Date, nullable=False)
    type = Column(String(50))
    wilaya_id = Column(Integer, ForeignKey("wilayas.id"), nullable=False)
    commune = Column(String(100))
    capital_assure = Column(Numeric(18, 2), nullable=False)
    prime_nette = Column(Numeric(18, 2), nullable=False)
    building_type_id = Column(Integer, ForeignKey("building_types.id"))
    is_active = Column(Boolean, default=True)
    imported_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    wilaya = relationship("Wilaya", back_populates="contracts")
    building_type = relationship("BuildingType", back_populates="contracts")
    risk_score = relationship("RiskScore", back_populates="contract", uselist=False)
    underwriting_decisions = relationship("UnderwritingDecision", back_populates="contract")