#!/usr/bin/env python
"""Initialize database with all tables and seed data"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, Base
from app.models import (
    User, Wilaya, BuildingType, RetentionConfig, Contract, RiskScore,
    PMLSimulation, HotspotSnapshot, UnderwritingDecision, PortfolioMonthlyStats,
    AIReport, SeismicAlert, AuditLog
)
from scripts.seed_data import seed_all
from app.core.logging import logger

def init_database():
    """Create all tables and seed static data"""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully")
    
    logger.info("Seeding static data...")
    seed_all()
    logger.info("Seeding completed")

if __name__ == "__main__":
    init_database()