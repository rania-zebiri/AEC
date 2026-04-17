from sqlalchemy import Column, Integer, Numeric, Date, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class PortfolioMonthlyStats(Base):
    __tablename__ = "portfolio_monthly_stats"
    
    id = Column(Integer, primary_key=True)
    month_date = Column(Date, nullable=False, unique=True)
    total_exposure_dzd = Column(Numeric(18, 2))
    total_premium_dzd = Column(Numeric(18, 2))
    active_contract_count = Column(Integer)
    hotspot_count = Column(Integer)
    zone3_exposure_dzd = Column(Numeric(18, 2))
    zone3_exposure_pct = Column(Numeric(6, 2))
    pml_mag65_dzd = Column(Numeric(18, 2))
    pml_mag65_pct_of_exposure = Column(Numeric(6, 2))
    balance_index = Column(Numeric(5, 1))
    new_contracts_count = Column(Integer)
    cancelled_contracts_count = Column(Integer)
    avg_risk_score = Column(Numeric(5, 1))
    max_risk_score = Column(Numeric(5, 1))
    computed_at = Column(DateTime(timezone=True), default=func.now())