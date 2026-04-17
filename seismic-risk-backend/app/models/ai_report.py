from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Date
from sqlalchemy.sql import func
from app.core.database import Base

class AIReport(Base):
    __tablename__ = "ai_reports"
    
    id = Column(Integer, primary_key=True)
    report_type = Column(String(30), nullable=False)
    report_text = Column(Text)
    input_hash = Column(String(64))
    input_snapshot_json = Column(JSON)
    model_used = Column(String(50))
    tokens_used = Column(Integer)
    reference_month = Column(Date)
    generated_by_user_id = Column(Integer, ForeignKey("users.id"))
    generated_at = Column(DateTime(timezone=True), default=func.now())
    is_valid = Column(Boolean, default=True)