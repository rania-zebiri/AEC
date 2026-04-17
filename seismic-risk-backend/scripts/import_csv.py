#!/usr/bin/env python
"""Import CSV data into database"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from datetime import datetime, date
from sqlalchemy import text
from app.core.database import SessionLocal
from app.core.logging import logger


def parse_amount(value) -> float:
    """Parse French-formatted numbers like '2500,000' or '-21500,000'"""
    if pd.isna(value):
        return 0.0
    return float(str(value).replace(',', '.').replace(' ', ''))


def parse_wilaya_id(value) -> int | None:
    """Extract wilaya ID from '19 - SETIF' -> 19"""
    try:
        return int(str(value).split(' - ')[0].strip())
    except Exception:
        return None


def parse_date(value) -> date | None:
    """Parse date from DD/MM/YYYY"""
    try:
        return datetime.strptime(str(value).strip(), "%d/%m/%Y").date()
    except Exception:
        return None


def get_building_type_id(contract_type: str, building_types: dict) -> int:
    """Map contract type string to building_type_id"""
    type_lower = str(contract_type).lower()
    if 'industrielle' in type_lower:
        return building_types.get('industrielle', 1)
    elif 'commerciale' in type_lower:
        return building_types.get('commerciale', 8)
    elif 'habitation' in type_lower or 'habitat' in type_lower:
        return building_types.get('habitation', 2)
    elif 'administrative' in type_lower:
        return building_types.get('administrative', 3)
    else:
        return 1  # default


def import_csv(filepath: str):
    print(f"Reading {filepath}...")
    df = pd.read_csv(filepath, dtype=str)
    print(f"Loaded {len(df)} rows, columns: {list(df.columns)}")

    db = SessionLocal()

    try:
        # Load building types lookup
        result = db.execute(text("SELECT id, label_fr FROM building_types"))
        building_types = {}
        for row in result:
            label = row[1].lower()
            if 'industrielle' in label:
                building_types['industrielle'] = row[0]
            elif 'commerciale' in label:
                building_types['commerciale'] = row[0]
            elif 'habitation' in label or 'habitat' in label:
                building_types['habitation'] = row[0]
            elif 'administrative' in label:
                building_types['administrative'] = row[0]

        stats = {"total": len(df), "inserted": 0, "updated": 0, "skipped": 0, "errors": 0}

        for idx, row in df.iterrows():
            try:
                numero_police = str(row.get('NUMERO_POLICE', '')).strip()
                if not numero_police or numero_police == 'nan':
                    stats['skipped'] += 1
                    continue

                wilaya_id = parse_wilaya_id(row.get('WILAYA', ''))
                date_effect = parse_date(row.get('DATE_EFFET', ''))
                date_expiration = parse_date(row.get('DATE_EXPIRATION', ''))
                capital_assure = parse_amount(row.get('CAPITAL_ASSURE', 0))
                prime_nette = parse_amount(row.get('PRIME_NETTE', 0))
                contract_type = str(row.get('TYPE', '')).strip()
                building_type_id = get_building_type_id(contract_type, building_types)
                commune_raw = str(row.get('COMMUNE', '')).strip()
                # Strip commune code prefix e.g. "111 - BIRTOUTA" -> "BIRTOUTA"
                commune = commune_raw.split(' - ')[-1].strip() if ' - ' in commune_raw else commune_raw
                code_sous_branche = str(row.get('CODE_SOUS_BRANCHE', '')).strip()
                num_avnt_cours = str(row.get('NUM_AVNT_COURS', '0')).strip()

                # Determine is_active based on expiration date
                is_active = date_expiration >= date.today() if date_expiration else False

                # UPSERT — on duplicate numero_police, update the record
                db.execute(text("""
                    INSERT INTO contracts (
                        numero_police, code_sous_branche, num_avnt_cours,
                        date_effect, date_expiration, type,
                        wilaya_id, commune, capital_assure, prime_nette,
                        building_type_id, is_active, imported_at
                    ) VALUES (
                        :numero_police, :code_sous_branche, :num_avnt_cours,
                        :date_effect, :date_expiration, :type,
                        :wilaya_id, :commune, :capital_assure, :prime_nette,
                        :building_type_id, :is_active, now()
                    )
                    ON CONFLICT (numero_police) DO UPDATE SET
                        code_sous_branche  = EXCLUDED.code_sous_branche,
                        num_avnt_cours     = EXCLUDED.num_avnt_cours,
                        date_effect        = EXCLUDED.date_effect,
                        date_expiration    = EXCLUDED.date_expiration,
                        type               = EXCLUDED.type,
                        wilaya_id          = EXCLUDED.wilaya_id,
                        commune            = EXCLUDED.commune,
                        capital_assure     = EXCLUDED.capital_assure,
                        prime_nette        = EXCLUDED.prime_nette,
                        building_type_id   = EXCLUDED.building_type_id,
                        is_active          = EXCLUDED.is_active,
                        imported_at        = now()
                """), {
                    "numero_police":    numero_police,
                    "code_sous_branche": code_sous_branche,
                    "num_avnt_cours":   num_avnt_cours,
                    "date_effect":      date_effect,
                    "date_expiration":  date_expiration,
                    "type":             contract_type,
                    "wilaya_id":        wilaya_id,
                    "commune":          commune,
                    "capital_assure":   capital_assure,
                    "prime_nette":      prime_nette,
                    "building_type_id": building_type_id,
                    "is_active":        is_active,
                })

                # Track insert vs update (PostgreSQL xmax trick)
                stats['inserted'] += 1

            except Exception as e:
                stats['errors'] += 1
                logger.error(f"Row {idx} error: {e}")
                db.rollback()
                continue

        db.commit()

        print(f"\n{'='*40}")
        print(f"IMPORT COMPLETE")
        print(f"{'='*40}")
        print(f"Total rows:  {stats['total']}")
        print(f"Inserted:    {stats['inserted']}")
        print(f"Errors:      {stats['errors']}")
        print(f"Skipped:     {stats['skipped']}")
        print(f"{'='*40}")

    except Exception as e:
        db.rollback()
        logger.error(f"Import failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_csv.py <path_to_csv>")
        sys.exit(1)
    import_csv(sys.argv[1])