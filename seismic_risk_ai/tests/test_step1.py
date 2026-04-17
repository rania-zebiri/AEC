import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.rpa_zones import get_zone_by_wilaya

test_wilayas = ["ALGER", "TIPAZA", "ADRAR", "MILA"]

print("--- Testing RPA Zone Logic ---")
for w in test_wilayas:
    zone = get_zone_by_wilaya(w)
    print(f"Wilaya: {w:10} -> RPA Zone: {zone}")