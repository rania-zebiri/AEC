"""
CSV Importer for Seismic Risk Portfolio System
Handles Algerian specific formats
"""
import csv
import re
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.contract import Contract
from app.models.wilaya import Wilaya
from app.models.building_type import BuildingType
from app.services.risk_scorer import RiskScorer
from app.core.logging import logger


class CSVImporter:
    """Import contracts from CSV file with Algerian format handling"""
    
    # Mapping for TYPE values to building_type codes
    TYPE_MAPPING = {
        "1 - Installation Industrielle": "RC",
        "2 - Résidentiel": "MACONNERIE",
        "3 - Commercial": "ACIER",
        "4 - Bureaux": "BETON",
        "5 - Établissement Scolaire": "RC",
        "6 - Établissement Hospitalier": "RC",
        "7 - Entrepôt": "MACONNERIE",
        "8 - Hôtel": "ACIER",
        "RC": "RC",
        "BETON": "BETON",
        "ACIER": "ACIER",
        "MACONNERIE": "MACONNERIE",
        "PIERRE": "PIERRE",
        "BOIS": "BOIS",
        "PISE": "PISE",
        "AUTRE": "AUTRE",
    }
    
    @classmethod
    def parse_date(cls, date_str: str) -> Optional[datetime]:
        """Parse DD/MM/YYYY format"""
        if not date_str:
            return None
        try:
            return datetime.strptime(str(date_str).strip(), "%d/%m/%Y").date()
        except:
            try:
                return datetime.strptime(str(date_str).strip(), "%Y-%m-%d").date()
            except:
                logger.error(f"Could not parse date: {date_str}")
                return None
    
    @classmethod
    def parse_wilaya_id(cls, wilaya_str: str, db: Session) -> Optional[int]:
        """Parse '9 - BLIDA' or '09' to wilaya ID"""
        if not wilaya_str:
            return None
        
        wilaya_str = str(wilaya_str).strip()
        match = re.search(r'(\d+)', wilaya_str)
        if not match:
            return None
        
        wilaya_num = int(match.group(1))
        wilaya_code = f"{wilaya_num:02d}"
        
        wilaya = db.query(Wilaya).filter(Wilaya.code == wilaya_code).first()
        if not wilaya:
            logger.warning(f"Wilaya not found for code: {wilaya_code}")
            return None
        return wilaya.id
    
    @classmethod
    def parse_commune(cls, commune_value: str) -> str:
        """Parse '111 - BIRTOUTA' -> 'BIRTOUTA'"""
        if not commune_value:
            return ""
        commune_str = str(commune_value).strip()
        if " - " in commune_str:
            return commune_str.split(" - ")[1].strip()
        return commune_str
    
    @classmethod
    def parse_building_type_id(cls, type_value: str, db: Session) -> Optional[int]:
        """Map CSV TYPE to building_type_id"""
        if not type_value:
            building_type = db.query(BuildingType).filter(BuildingType.code == "AUTRE").first()
            return building_type.id if building_type else None
        
        type_str = str(type_value).strip()
        building_code = cls.TYPE_MAPPING.get(type_str, "AUTRE")
        
        building_type = db.query(BuildingType).filter(BuildingType.code == building_code).first()
        if not building_type:
            building_type = db.query(BuildingType).filter(BuildingType.code == "AUTRE").first()
        
        return building_type.id if building_type else None
    
    @classmethod
    def parse_amount(cls, amount_str: str) -> float:
        """Parse French format numbers (comma as decimal)"""
        if not amount_str:
            return 0.0
        
        amount_str = str(amount_str).strip()
        is_negative = amount_str.startswith('-')
        if is_negative:
            amount_str = amount_str[1:]
        
        amount_str = amount_str.replace(',', '.')
        
        try:
            value = float(amount_str)
            return -value if is_negative else value
        except ValueError:
            logger.error(f"Could not parse amount: {amount_str}")
            return 0.0
    
    @classmethod
    def import_csv(cls, db: Session, file_path: str) -> Dict[str, int]:
        """Import CSV file and return statistics"""
        
        stats = {
            "total_rows": 0,
            "imported": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0
        }
        
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            sample = f.read(1024)
            f.seek(0)
            
            if ';' in sample:
                delimiter = ';'
            elif '\t' in sample:
                delimiter = '\t'
            else:
                delimiter = ','
            
            reader = csv.DictReader(f, delimiter=delimiter)
            reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
            
            for row_num, row in enumerate(reader, 2):
                stats["total_rows"] += 1
                
                try:
                    numero_police = row.get('NUMERO_POLICE', '').strip()
                    if not numero_police:
                        stats["skipped"] += 1
                        continue
                    
                    existing = db.query(Contract).filter(
                        Contract.numero_police == numero_police
                    ).first()
                    
                    if existing:
                        contract = existing
                        is_update = True
                    else:
                        contract = Contract()
                        contract.numero_police = numero_police
                        is_update = False
                    
                    contract.code_sous_branche = row.get('CODE_SOUS_BRANCHE', '').strip()
                    contract.num_avnt_cours = row.get('NUM_AVNT_COURS', '').strip()
                    
                    date_effect = cls.parse_date(row.get('DATE_EFFET', ''))
                    date_expiration = cls.parse_date(row.get('DATE_EXPIRATION', ''))
                    
                    if not date_effect or not date_expiration:
                        stats["errors"] += 1
                        continue
                    
                    contract.date_effect = date_effect
                    contract.date_expiration = date_expiration
                    contract.type = row.get('TYPE', '').strip()
                    
                    wilaya_id = cls.parse_wilaya_id(row.get('WILAYA', ''), db)
                    if not wilaya_id:
                        stats["errors"] += 1
                        continue
                    contract.wilaya_id = wilaya_id
                    
                    contract.commune = cls.parse_commune(row.get('COMMUNE', ''))
                    contract.capital_assure = cls.parse_amount(row.get('CAPITAL_ASSURE', '0'))
                    contract.prime_nette = cls.parse_amount(row.get('PRIME_NETTE', '0'))
                    contract.building_type_id = cls.parse_building_type_id(contract.type, db)
                    
                    today = datetime.now().date()
                    contract.is_active = date_effect <= today <= date_expiration
                    
                    if is_update:
                        db.commit()
                        stats["updated"] += 1
                    else:
                        db.add(contract)
                        db.commit()
                        db.refresh(contract)
                        stats["imported"] += 1
                    
                    RiskScorer.compute_and_save(db, contract.id)
                    
                except Exception as e:
                    logger.error(f"Error importing row {row_num}: {e}")
                    stats["errors"] += 1
                    db.rollback()
        
        return stats