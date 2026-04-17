from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class PMLSimulation(Base):
    __tablename__ = "pml_simulations"
    
    id = Column(Integer, primary_key=True)
    wilaya_id = Column(Integer, ForeignKey("wilayas.id"), nullable=False)
    magnitude = Column(Numeric(4, 2), nullable=False)
    scenario_month = Column(Date)
    total_capital_dzd = Column(Numeric(18, 2))
    contract_count = Column(Integer)
    expected_loss_dzd = Column(Numeric(18, 2))
    reinsurance_cover_dzd = Column(Numeric(18, 2))
    net_company_loss_dzd = Column(Numeric(18, 2))
    loss_ratio_pct = Column(Numeric(6, 2))
    intensity_factor_used = Column(Numeric(5, 4))
    ai_narrative = Column(Text)
    simulated_by_user_id = Column(Integer, ForeignKey("users.id"))
    simulated_at = Column(DateTime(timezone=True), default=func.now())
    
    # Relationships
    wilaya = relationship("Wilaya", back_populates="pml_simulations")
    seismic_alert = relationship("SeismicAlert", back_populates="auto_pml", uselist=False)