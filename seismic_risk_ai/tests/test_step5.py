import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.hotspot_detector import detect_hotspots

# Mock Portfolio: Alger has 1.5 Billion (Over limit), Oran has 500 Million (Under limit)
mock_portfolio = [
    {"wilaya": "Alger", "capital": 800_000_000},
    {"wilaya": "Alger", "capital": 700_000_000}, # Total Alger = 1.5B
    {"wilaya": "Oran",  "capital": 500_000_000}
]

# Set limit at 1 Billion DZD
LIMIT = 1_000_000_000

print(f"--- Testing Hotspot Detection (Limit: {LIMIT:,} DZD) ---")
hotspots = detect_hotspots(mock_portfolio, LIMIT)

if not hotspots:
    print("No hotspots detected. Portfolio is balanced.")
else:
    for h in hotspots:
        print(f"  HOTSPOT FOUND: {h['wilaya']}")
        print(f"   Total Exposure: {h['total_exposure']:,} DZD")
        print(f"   Over Capacity:  {h['percentage_over']}%")
        print(f"   Status:         {h['severity']}")