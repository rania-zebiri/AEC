from sqlalchemy import Column, Integer, String, Numeric, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class BuildingType(Base):
    __tablename__ = "building_types"
    
    id = Column(Integer, primary_key=True)
    code = Column(String(30), unique=True, nullable=False)
    label_fr = Column(String(100), nullable=False)
    vulnerability_factor = Column(Numeric(4, 2), nullable=False)
    description = Column(Text)
    risk_category = Column(String(10), nullable=False)
    
    # Relationships
    contracts = relationship("Contract", back_populates="building_type")