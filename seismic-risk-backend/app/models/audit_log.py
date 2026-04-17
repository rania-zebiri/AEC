from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, BigInteger
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"
    
    id = Column(BigInteger, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(60), nullable=False)
    entity_type = Column(String(40))
    entity_id = Column(Integer)
    detail_json = Column(JSON)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), default=func.now())