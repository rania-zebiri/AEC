import numpy as np
import xgboost as xgb
import os
from datetime import datetime

from seismic_risk_ai.services.recommandation import (
    generate_acaps_report_data,
    generate_acaps_text
)

MODEL_PATH = "risk_model.json"


def run_test():
    print("🚀 Starting FULL SYSTEM TEST...\n")

    # -------------------------
    # A. Load model
    # -------------------------
    if not os.path.exists(MODEL_PATH):
        print("❌ Model not found")
        return

    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH)
    print("✅ Model loaded\n")

    # -------------------------
    # B. Fake portfolio
    # -------------------------
    raw_data = [
        {
            "id": "POL-001",
            "wilaya": "16 - ALGER",
            "commune": "Bab Ezzouar",
            "capital": 5000000,
            "features": [15, 102, 1, 15.42, 4]
        },
        {
            "id": "POL-002",
            "wilaya": "09 - BLIDA",
            "commune": "Blida",
            "capital": 12000000,
            "features": [8, 45, 1, 16.30, 4]
        },
        {
            "id": "POL-003",
            "wilaya": "11 - TAMANRASSET",
            "commune": "Tamanrasset",
            "capital": 1500000,
            "features": [10, 12, 0, 14.22, 4]
        }
    ]

    # -------------------------
    # C. Run AI predictions
    # -------------------------
    print("🤖 Running AI predictions...\n")

    for contract in raw_data:
        X = np.array([contract["features"]])
        pred = model.predict(X)[0]
        contract["risk_label"] = "HIGH RISK" if pred == 1 else "STANDARD"

        print(f"{contract['id']} → {contract['risk_label']}")

    # -------------------------
    # D. Generate report data
    # -------------------------
    print("\n📊 Generating report data...")
    report_data = generate_acaps_report_data(raw_data)
    print(report_data)

    # -------------------------
    # E. Generate report text
    # -------------------------
    print("\n📝 Generating report text...\n")
    report_text = generate_acaps_text(report_data)
    print(report_text)

    print("\n✅ TEST COMPLETED SUCCESSFULLY")


if __name__ == "__main__":
    run_test()