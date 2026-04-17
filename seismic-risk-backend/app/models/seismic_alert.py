from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class SeismicAlert(Base):
    __tablename__ = "seismic_alerts"
    
    id = Column(Integer, primary_key=True)
    event_id_external = Column(String(50), unique=True)
    event_datetime = Column(DateTime(timezone=True), nullable=False)
    magnitude = Column(Numeric(4, 2), nullable=False)
    wilaya_id = Column(Integer, ForeignKey("wilayas.id"))
    epicenter_lat = Column(Numeric(9, 6))
    epicenter_lng = Column(Numeric(9, 6))
    depth_km = Column(Numeric(6, 2))
    auto_pml_id = Column(Integer, ForeignKey("pml_simulations.id"))
    alert_sent = Column(Boolean, default=False)
    alert_sent_at = Column(DateTime(timezone=True))
    received_at = Column(DateTime(timezone=True), default=func.now())
    
    # Relationships
    wilaya = relationship("Wilaya", back_populates="seismic_alerts")