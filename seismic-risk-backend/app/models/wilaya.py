from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Wilaya(Base):
    __tablename__ = "wilayas"
    
    id = Column(Integer, primary_key=True)
    code = Column(String(5), unique=True, nullable=False)
    name_fr = Column(String(100), nullable=False)
    name_ar = Column(String(100))
    rpa_zone = Column(String(5), nullable=False)
    zone_score = Column(Numeric(3, 1), nullable=False)
    map_color = Column(String(20))
    latitude = Column(Numeric(9, 6))
    longitude = Column(Numeric(9, 6))
    region = Column(String(50))
    population_growth_pct = Column(Numeric(5, 2), default=0)
    competition_level = Column(String(10), default="MEDIUM")
    
    # Relationships
    contracts = relationship("Contract", back_populates="wilaya")
    hotspot_snapshots = relationship("HotspotSnapshot", back_populates="wilaya")
    pml_simulations = relationship("PMLSimulation", back_populates="wilaya")
    seismic_alerts = relationship("SeismicAlert", back_populates="wilaya")