
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# UPDATE THIS LINE:
from core.rpa_zones import get_zone_by_location 

def test_rpa_logic():
    print("Testing RPA 99 Zoning Logic...")
    
    # Test a simple Wilaya
    alger_zone = get_zone_by_location("Alger")
    print(f"Alger is Zone: {alger_zone}")
    
    # Test a specific Commune from the RPA document (e.g., Medea)
    medea_commune = get_zone_by_location("Medea", "El Hamdania")
    print(f"Medea (El Hamdania) is Zone: {medea_commune}")

if __name__ == "__main__":
    test_rpa_logic()