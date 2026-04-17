import sys
import os
# Fix for the path error we had before
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.vulnerability import get_vulnerability_factor

test_types = ["Beton Armé", "Acier", "Pierre", "Unknown Type"]

print("--- Testing Vulnerability Logic ---")
for t in test_types:
    factor = get_vulnerability_factor(t)
    print(f"Structure: {t:15} -> Factor: {factor}")