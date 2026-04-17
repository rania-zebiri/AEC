#!/usr/bin/env python
"""Compute risk scores for all contracts"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.contract import Contract
from app.models.risk_score import RiskScore
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from sqlalchemy import func

db = SessionLocal()

# Get total contracts
total_contracts = db.query(Contract).count()
print(f'Found {total_contracts} contracts')

# Get existing risk scores to avoid duplicates
existing = set(r[0] for r in db.query(RiskScore.contract_id).all())
print(f'Existing risk scores: {len(existing)}')

# Contracts without risk scores
contracts = db.query(Contract).filter(Contract.id.notin_(existing)).all()
print(f'Need to compute: {len(contracts)}')

count = 0
for contract in contracts:
    # Get wilaya zone score
    wilaya = db.query(Wilaya).filter(Wilaya.id == contract.wilaya_id).first()
    zone_score = float(wilaya.zone_score) if wilaya else 1.0
    normalized_zone = min(zone_score / 3.0, 1.0)
    
    # Get vulnerability factor
    building = db.query(BuildingType).filter(BuildingType.id == contract.building_type_id).first()
    vulnerability = float(building.vulnerability_factor) if building else 0.5
    
    # Normalize capital
    capital = float(contract.capital_assure)
    import math
    if capital > 0:
        normalized_capital = min(math.log10(capital + 1) / math.log10(1_000_000_000 + 1), 1.0)
    else:
        normalized_capital = 0
    
    # Calculate components
    zone_component = normalized_zone * 100
    vuln_component = vulnerability * 100
    capital_component = normalized_capital * 100
    
    # Weighted total
    total_score = zone_component * 0.4 + vuln_component * 0.3 + capital_component * 0.3
    
    # Determine risk level
    if total_score >= 75:
        risk_level = "CRITICAL"
    elif total_score >= 50:
        risk_level = "HIGH"
    elif total_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    risk_score = RiskScore(
        contract_id=contract.id,
        risk_score=round(total_score, 1),
        risk_level=risk_level,
        zone_score_component=round(zone_component, 2),
        vuln_component=round(vuln_component, 2),
        capital_component=round(capital_component, 2)
    )
    db.add(risk_score)
    count += 1
    
    if count % 100 == 0:
        db.commit()
        print(f'  Computed {count} scores...')

db.commit()
print(f'✅ Computed {count} new risk scores')

# Show summary
total_risk = db.query(RiskScore).count()
print(f'\n📊 Summary:')
print(f'   Total contracts: {total_contracts}')
print(f'   Total risk scores: {total_risk}')

# Distribution by risk level
dist = db.query(RiskScore.risk_level, func.count(RiskScore.id)).group_by(RiskScore.risk_level).all()
print(f'\n📈 Risk distribution:')
for level, count in dist:
    print(f'   {level}: {count}')

db.close()
