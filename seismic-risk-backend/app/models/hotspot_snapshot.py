from sqlalchemy import Column, Integer, Numeric, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class HotspotSnapshot(Base):
    __tablename__ = "hotspot_snapshots"
    
    id = Column(Integer, primary_key=True)
    wilaya_id = Column(Integer, ForeignKey("wilayas.id"), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    total_capital_dzd = Column(Numeric(18, 2), nullable=False)
    contract_count = Column(Integer, nullable=False)
    is_hotspot = Column(Boolean, nullable=False)
    excess_dzd = Column(Numeric(18, 2), default=0)
    excess_pct = Column(Numeric(7, 2), default=0)
    retention_capacity_dzd = Column(Numeric(18, 2), nullable=False)
    pml_mag65_dzd = Column(Numeric(18, 2))
    
    # Relationships
    wilaya = relationship("Wilaya", back_populates="hotspot_snapshots")