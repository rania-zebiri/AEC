from seismic_risk_ai.services.report_generator import ReportGenerator

def run_local_test():
    # Data extracted from your dashboard screenshots
    mock_data = {
        "summary": "Par rapport au mois précédent, l'exposition totale du portefeuille a augmenté de 18.3 milliard DZD (0%). 2 hotspots actifs détectés.",
        "indicators": [
            {"name": "Total Exposure", "curr": "18.3B DZD", "change": "+18.3B"},
            {"name": "Zone III Share", "curr": "11.7%", "change": "+11.7%"},
            {"name": "Balance Index", "curr": "50.0", "change": "+50.0"},
            {"name": "Active Hotspots", "curr": "2", "change": "+2"}
        ]
    }

    generator = ReportGenerator(output_dir="data")
    result_path = generator.generate_pdf(mock_data, "test_output.pdf")

    if result_path:
        print(f"✅ Success! Report generated at: {result_path}")
    else:
        print("❌ Report generation failed.")

if __name__ == "__main__":
    run_local_test()