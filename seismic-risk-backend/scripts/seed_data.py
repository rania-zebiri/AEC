from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Wilaya, BuildingType, RetentionConfig, User
from datetime import date
import hashlib
import secrets

def get_password_hash(password: str) -> str:
    """Simple password hashing (for development only)"""
    # This is a simple hash for development - use proper bcrypt in production
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ":" + salt

# Complete 48 Wilayas Data
WILAYAS_DATA = [
    (1, "01", "Adrar", "أدرار", "I", 1.0, "Sud", 2.5, "LOW"),
    (2, "02", "Chlef", "الشلف", "IIb", 2.0, "Nord", 3.0, "MEDIUM"),
    (3, "03", "Laghouat", "الأغواط", "I", 1.0, "Hauts Plateau", 2.8, "LOW"),
    (4, "04", "Oum El Bouaghi", "أم البواقي", "I", 1.0, "Hauts Plateau", 2.5, "LOW"),
    (5, "05", "Batna", "باتنة", "I", 1.0, "Hauts Plateau", 3.0, "MEDIUM"),
    (6, "06", "Béjaïa", "بجاية", "III", 3.0, "Nord", 3.5, "HIGH"),
    (7, "07", "Biskra", "بسكرة", "I", 1.0, "Sud", 3.2, "MEDIUM"),
    (8, "08", "Béchar", "بشار", "I", 1.0, "Sud", 2.8, "LOW"),
    (9, "09", "Blida", "البليدة", "III", 3.0, "Nord", 4.0, "HIGH"),
    (10, "10", "Bouira", "البويرة", "IIb", 2.0, "Nord", 3.2, "MEDIUM"),
    (11, "11", "Tamanrasset", "تمنراست", "0", 0.5, "Sud", 4.5, "LOW"),
    (12, "12", "Tébessa", "تبسة", "I", 1.0, "Hauts Plateau", 2.5, "LOW"),
    (13, "13", "Tlemcen", "تلمسان", "IIa", 1.5, "Nord", 3.2, "HIGH"),
    (14, "14", "Tiaret", "تيارت", "I", 1.0, "Hauts Plateau", 2.8, "MEDIUM"),
    (15, "15", "Tizi Ouzou", "تيزي وزو", "III", 3.0, "Nord", 3.5, "HIGH"),
    (16, "16", "Alger", "الجزائر", "III", 3.0, "Nord", 4.5, "HIGH"),
    (17, "17", "Djelfa", "الجلفة", "I", 1.0, "Hauts Plateau", 3.0, "MEDIUM"),
    (18, "18", "Jijel", "جيجل", "III", 3.0, "Nord", 3.2, "MEDIUM"),
    (19, "19", "Sétif", "سطيف", "IIb", 2.0, "Hauts Plateau", 3.5, "HIGH"),
    (20, "20", "Saïda", "سعيدة", "I", 1.0, "Hauts Plateau", 2.5, "LOW"),
    (21, "21", "Skikda", "سكيكدة", "III", 3.0, "Nord", 3.0, "MEDIUM"),
    (22, "22", "Sidi Bel Abbès", "سيدي بلعباس", "IIa", 1.5, "Nord", 3.0, "MEDIUM"),
    (23, "23", "Annaba", "عنابة", "III", 3.0, "Nord", 3.8, "HIGH"),
    (24, "24", "Guelma", "قالمة", "IIb", 2.0, "Nord", 2.8, "MEDIUM"),
    (25, "25", "Constantine", "قسنطينة", "IIb", 2.0, "Nord", 3.5, "HIGH"),
    (26, "26", "Médéa", "المدية", "IIb", 2.0, "Nord", 3.0, "MEDIUM"),
    (27, "27", "Mostaganem", "مستغانم", "IIa", 1.5, "Nord", 3.2, "MEDIUM"),
    (28, "28", "M'Sila", "المسيلة", "I", 1.0, "Hauts Plateau", 3.0, "MEDIUM"),
    (29, "29", "Mascara", "معسكر", "IIa", 1.5, "Nord", 2.8, "MEDIUM"),
    (30, "30", "Ouargla", "ورقلة", "I", 1.0, "Sud", 3.5, "LOW"),
    (31, "31", "Oran", "وهران", "IIb", 2.0, "Nord", 4.0, "HIGH"),
    (32, "32", "El Bayadh", "البيض", "I", 1.0, "Hauts Plateau", 2.5, "LOW"),
    (33, "33", "Illizi", "إليزي", "0", 0.5, "Sud", 3.0, "LOW"),
    (34, "34", "Bordj Bou Arréridj", "برج بوعريريج", "IIb", 2.0, "Hauts Plateau", 3.2, "MEDIUM"),
    (35, "35", "Boumerdès", "بومرداس", "III", 3.0, "Nord", 4.0, "HIGH"),
    (36, "36", "El Tarf", "الطارف", "III", 3.0, "Nord", 3.0, "MEDIUM"),
    (37, "37", "Tindouf", "تندوف", "0", 0.5, "Sud", 3.5, "LOW"),
    (38, "38", "Tissemsilt", "تيسمسيلت", "IIa", 1.5, "Nord", 2.5, "LOW"),
    (39, "39", "El Oued", "الوادي", "I", 1.0, "Sud", 3.2, "MEDIUM"),
    (40, "40", "Khenchela", "خنشلة", "I", 1.0, "Hauts Plateau", 2.8, "LOW"),
    (41, "41", "Souk Ahras", "سوق أهراس", "IIb", 2.0, "Nord", 2.5, "LOW"),
    (42, "42", "Tipaza", "تيبازة", "III", 3.0, "Nord", 3.8, "HIGH"),
    (43, "43", "Mila", "ميلة", "IIb", 2.0, "Nord", 3.0, "MEDIUM"),
    (44, "44", "Aïn Defla", "عين الدفلى", "IIb", 2.0, "Nord", 3.2, "MEDIUM"),
    (45, "45", "Naâma", "النعامة", "I", 1.0, "Hauts Plateau", 2.5, "LOW"),
    (46, "46", "Aïn Témouchent", "عين تموشنت", "IIa", 1.5, "Nord", 3.0, "MEDIUM"),
    (47, "47", "Ghardaïa", "غرداية", "I", 1.0, "Sud", 3.5, "MEDIUM"),
    (48, "48", "Relizane", "غليزان", "IIa", 1.5, "Nord", 3.2, "MEDIUM"),
]

# Building Types Data
BUILDING_TYPES_DATA = [
    ("RC", "Béton armé (conforme RPA)", 0.20, "LOW"),
    ("BETON", "Béton armé (ancien)", 0.30, "LOW"),
    ("ACIER", "Structure métallique", 0.20, "LOW"),
    ("MACONNERIE", "Maçonnerie / Brique", 0.55, "MEDIUM"),
    ("PIERRE", "Pierre traditionnelle", 0.85, "HIGH"),
    ("BOIS", "Structure bois", 0.35, "LOW"),
    ("PISE", "Pise / Terre compactée", 0.90, "CRITICAL"),
    ("AUTRE", "Autre / Non spécifié", 0.50, "MEDIUM"),
]

# Retention Config Data
RETENTION_CONFIG_DATA = [
    ("GLOBAL_RETENTION_CAPACITY", 1000000000.00, "Capacité de rétention max par wilaya (DZD)", "DZD"),
    ("REINSURANCE_COVERAGE_RATIO", 0.40, "Part couverte par la réassurance (40%)", "RATIO"),
    ("PML_DEFAULT_MAGNITUDE", 6.50, "Magnitude par défaut pour calcul PML mensuel", "RICHTER"),
    ("SCORE_CRITICAL_THRESHOLD", 75.00, "Seuil score CRITICAL (>= ce score = CRITICAL)", "SCORE"),
    ("SCORE_HIGH_THRESHOLD", 50.00, "Seuil score HIGH", "SCORE"),
    ("SCORE_MEDIUM_THRESHOLD", 25.00, "Seuil score MEDIUM", "SCORE"),
]

def seed_wilayas(db: Session):
    """Seed all 48 wilayas"""
    for id_num, code, name_fr, name_ar, rpa_zone, zone_score, region, pop_growth, comp_level in WILAYAS_DATA:
        # Set map color based on zone_score
        if zone_score >= 2.5:
            map_color = "red"
        elif zone_score >= 1.5:
            map_color = "orange"
        elif zone_score >= 0.8:
            map_color = "yellow"
        else:
            map_color = "green"
        
        wilaya = Wilaya(
            code=code,
            name_fr=name_fr,
            name_ar=name_ar,
            rpa_zone=rpa_zone,
            zone_score=zone_score,
            map_color=map_color,
            latitude=None,
            longitude=None,
            region=region,
            population_growth_pct=pop_growth,
            competition_level=comp_level
        )
        db.add(wilaya)
    db.commit()
    print(f"Seeded {len(WILAYAS_DATA)} wilayas")

def seed_building_types(db: Session):
    """Seed building types"""
    for code, label, vuln, category in BUILDING_TYPES_DATA:
        building_type = BuildingType(
            code=code,
            label_fr=label,
            vulnerability_factor=vuln,
            risk_category=category,
            description=f"Type de bâtiment: {label}"
        )
        db.add(building_type)
    db.commit()
    print(f"Seeded {len(BUILDING_TYPES_DATA)} building types")

def seed_retention_config(db: Session):
    """Seed retention configuration"""
    for key, value, desc, unit in RETENTION_CONFIG_DATA:
        config = RetentionConfig(
            config_key=key,
            config_value=value,
            description=desc,
            unit=unit,
            effective_from=date(2024, 1, 1)
        )
        db.add(config)
    db.commit()
    print(f"Seeded {len(RETENTION_CONFIG_DATA)} retention configs")

def seed_users(db: Session):
    """Seed initial users with simple password hashing"""
    
    # Admin user (password: admin123)
    admin = User(
        username="admin",
        email="admin@seismic-risk.com",
        password_hash=get_password_hash("admin123"),
        full_name="Administrator",
        role="ADMIN",
        is_active=True,
        receive_alerts=True
    )
    db.add(admin)
    
    # Manager user (password: manager123)
    manager = User(
        username="manager",
        email="manager@seismic-risk.com",
        password_hash=get_password_hash("manager123"),
        full_name="Risk Manager",
        role="MANAGER",
        is_active=True,
        receive_alerts=True
    )
    db.add(manager)
    
    # Analyst user (password: analyst123)
    analyst = User(
        username="analyst",
        email="analyst@seismic-risk.com",
        password_hash=get_password_hash("analyst123"),
        full_name="Risk Analyst",
        role="ANALYST",
        is_active=True,
        receive_alerts=False
    )
    db.add(analyst)
    
    db.commit()
    print("Seeded 3 users (admin/manager/analyst)")
    print("  - admin / admin123")
    print("  - manager / manager123")
    print("  - analyst / analyst123")

def seed_all():
    """Seed all static data"""
    db = SessionLocal()
    try:
        print("Starting database seeding...")
        seed_wilayas(db)
        seed_building_types(db)
        seed_retention_config(db)
        seed_users(db)
        print("All static data seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()