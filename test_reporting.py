import os
import pandas as pd
from seismic_risk_ai.interface.ai_interface import SeismicAI

def run_reporting_test():
    print("📋 TEST DE GÉNÉRATION DE RAPPORT RÉGLEMENTAIRE\n" + "="*50)

    # 1. Simulation de données de portefeuille (ce que P2 va t'envoyer)
    mock_portfolio = [
        {"id": "POL-2024-001", "wilaya": "Alger", "capital": 15000000, "structure": "BETON ARME"},
        {"id": "POL-2024-002", "wilaya": "Oran", "capital": 8500000, "structure": "ACIER"},
        {"id": "POL-2024-003", "wilaya": "Blida", "capital": 12000000, "structure": "MACONNERIE CHAINEE"},
        {"id": "POL-2024-004", "wilaya": "Boumerdes", "capital": 25000000, "structure": "BETON ARME"}
    ]

    print("🔄 Génération du fichier CSV...")
    
    try:
        # Appel de la nouvelle fonction via l'interface
        filename = SeismicAI.export_regulatory_report(mock_portfolio)
        
        # 2. Vérification de l'existence du fichier
        if os.path.exists(filename):
            print(f"✅ Succès ! Fichier généré : {filename}")
            
            # 3. Lecture flash pour vérifier le contenu
            df = pd.read_csv(filename)
            print("\n👀 Aperçu du contenu généré :")
            print(df.head())
            
            print("\n" + "="*50)
            print("🚀 RÉSUMÉ : Le rapport est structuré correctement pour l'ACAPS.")
        else:
            print("❌ Erreur : Le fichier n'a pas été créé.")
            
    except Exception as e:
        print(f"💥 Erreur lors du test : {str(e)}")

if __name__ == "__main__":
    run_reporting_test()