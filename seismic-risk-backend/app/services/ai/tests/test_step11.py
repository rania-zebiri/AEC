import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.llm_service import generate_strategic_report

health = 45.5
hotspots = [{'wilaya': 'ALGER'}, {'wilaya': 'BLIDA'}]

print("--- Calling Free LLM (Groq) ---")
report = generate_strategic_report(health, hotspots)
print("\nGenerated Report:\n")
print(report)