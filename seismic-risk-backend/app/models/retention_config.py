from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class RetentionConfig(Base):
    __tablename__ = "retention_config"
    
    id = Column(Integer, primary_key=True)
    config_key = Column(String(60), unique=True, nullable=False)
    config_value = Column(Numeric(18, 2), nullable=False)
    description = Column(Text)
    unit = Column(String(20))
    effective_from = Column(Date, nullable=False)
    updated_by_user_id = Column(Integer, ForeignKey("users.id"))
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())