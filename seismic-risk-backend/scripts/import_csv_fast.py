#!/usr/bin/env python
"""Fast CSV Import with Batch Processing"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
import re
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.models.risk_score import RiskScore
from app.core.logging import logger

def parse_date(date_str):
    try:
        return datetime.strptime(str(date_str).strip(), "%d/%m/%Y").date()
    except:
        return None

def parse_wilaya_id(wilaya_str, wilaya_cache):
    match = re.search(r'(\d+)', str(wilaya_str))
    if not match:
        return None
    wilaya_code = f"{int(match.group(1)):02d}"
    return wilaya_cache.get(wilaya_code)

def parse_amount(amount_str):
    if not amount_str:
        return 0.0
    amount_str = str(amount_str).strip().replace(',', '.')
    try:
        return float(amount_str)
    except:
        return 0.0

def parse_commune(commune_str):
    if " - " in str(commune_str):
        return str(commune_str).split(" - ")[1].strip()
    return str(commune_str).strip()

TYPE_MAPPING = {
    "1 - Installation Industrielle": "RC",
    "2 - Installation Commerciale": "AUTRE",
    "3 - Résidentiel": "MACONNERIE",
}

def parse_building_type_id(type_str, building_cache):
    building_code = TYPE_MAPPING.get(str(type_str).strip(), "AUTRE")
    return building_cache.get(building_code)

def compute_risk_score(capital, zone_score, vulnerability):
    zone_norm = min(zone_score / 3.0, 1.0)
    capital_norm = min(capital / 1_000_000_000, 1.0)
    score = (zone_norm * 0.4 + vulnerability * 0.3 + capital_norm * 0.3) * 100
    level = "CRITICAL" if score >= 75 else "HIGH" if score >= 50 else "MEDIUM" if score >= 25 else "LOW"
    return round(score, 1), level

def import_csv_fast(file_path):
    print(f"Reading {file_path}...")
    
    db = SessionLocal()
    
    # Load caches
    wilayas = {w.code: w.id for w in db.query(Wilaya).all()}
    building_types = {b.code: b.id for b in db.query(BuildingType).all()}
    
    # Get existing policies
    existing = set(c[0] for c in db.query(Contract.numero_police).all())
    
    # Read CSV
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        sample = f.read(1024)
        f.seek(0)
        delimiter = ';' if ';' in sample else ','
        reader = csv.DictReader(f, delimiter=delimiter)
        
        contracts_to_add = []
        today = datetime.now().date()
        
        for row in reader:
            numero = row.get('NUMERO_POLICE', '').strip()
            if not numero or numero in existing:
                continue
            
            date_effect = parse_date(row.get('DATE_EFFET', ''))
            date_expiration = parse_date(row.get('DATE_EXPIRATION', ''))
            if not date_effect or not date_expiration:
                continue
            
            wilaya_id = parse_wilaya_id(row.get('WILAYA', ''), wilayas)
            if not wilaya_id:
                continue
            
            building_type_id = parse_building_type_id(row.get('TYPE', ''), building_types)
            
            capital = parse_amount(row.get('CAPITAL_ASSURE', '0'))
            premium = parse_amount(row.get('PRIME_NETTE', '0'))
            is_active = date_effect <= today <= date_expiration
            
            contract = Contract(
                numero_police=numero,
                code_sous_branche=row.get('CODE_SOUS_BRANCHE', '').strip(),
                num_avnt_cours=row.get('NUM_AVNT_COURS', '').strip(),
                date_effect=date_effect,
                date_expiration=date_expiration,
                type=row.get('TYPE', '').strip(),
                wilaya_id=wilaya_id,
                commune=parse_commune(row.get('COMMUNE', '')),
                capital_assure=capital,
                prime_nette=premium,
                building_type_id=building_type_id or 8,
                is_active=is_active
            )
            contracts_to_add.append(contract)
            
            if len(contracts_to_add) >= 500:
                db.bulk_save_objects(contracts_to_add)
                db.commit()
                print(f"Imported {len(contracts_to_add)} contracts...")
                contracts_to_add = []
        
        if contracts_to_add:
            db.bulk_save_objects(contracts_to_add)
            db.commit()
            print(f"Imported final {len(contracts_to_add)} contracts")
    
    # Now compute risk scores in batch
    print("Computing risk scores...")
    contracts = db.query(Contract).filter(Contract.risk_score == None).all()
    
    risk_scores = []
    for contract in contracts:
        wilaya = db.query(Wilaya).filter(Wilaya.id == contract.wilaya_id).first()
        building = db.query(BuildingType).filter(BuildingType.id == contract.building_type_id).first()
        
        zone_score = float(wilaya.zone_score) if wilaya else 1.0
        vulnerability = float(building.vulnerability_factor) if building else 0.5
        risk_score, risk_level = compute_risk_score(float(contract.capital_assure), zone_score, vulnerability)
        
        zone_norm = min(zone_score / 3.0, 1.0) * 100
        vuln_norm = vulnerability * 100
        capital_norm = min(float(contract.capital_assure) / 1_000_000_000, 1.0) * 100
        
        rs = RiskScore(
            contract_id=contract.id,
            risk_score=risk_score,
            risk_level=risk_level,
            zone_score_component=round(zone_norm, 2),
            vuln_component=round(vuln_norm, 2),
            capital_component=round(capital_norm, 2)
        )
        risk_scores.append(rs)
        
        if len(risk_scores) >= 500:
            db.bulk_save_objects(risk_scores)
            db.commit()
            risk_scores = []
    
    if risk_scores:
        db.bulk_save_objects(risk_scores)
        db.commit()
    
    total = db.query(Contract).count()
    print(f"\n✅ Import complete! Total contracts: {total}")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_csv_fast.py <csv_file>")
        sys.exit(1)
    import_csv_fast(sys.argv[1])
