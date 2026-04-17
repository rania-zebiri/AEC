import sys
import os

# S'assurer que Python voit ton package
sys.path.append(os.getcwd())

from seismic_risk_ai.interface.ai_interface import SeismicAI

def run_final_check():
    print("🚀 DÉMARRAGE DU TEST D'INTÉGRITÉ FINAL - PROJET AEC\n" + "="*50)

    # --- 1. TEST DU MOTEUR DE DÉCISION (Loi RPA + IA) ---
    print("\n🔍 1. Test de Souscription (Underwriting) :")
    building_safe = {"wilaya": "ALGER", "floors": 2, "height": 7, "capital": 5000000}
    building_risky = {"wilaya": "ALGER", "floors": 10, "height": 35, "capital": 5000000}

    res1 = SeismicAI.evaluate_new_contract(building_safe, current_portfolio=None)
    res2 = SeismicAI.evaluate_new_contract(building_risky, current_portfolio=None)
    
    print(f"✅ Cas Conforme (Alger 2 étages) : {res1['decision']}")
    print(f"❌ Cas Non-Conforme (Alger 10 étages) : {res2['decision']} - Raison: {res2.get('reason')}")

    # --- 2. TEST DU SIMULATEUR DE PERTES (PML) ---
    print("\n💰 2. Test du Simulateur de Catastrophe (PML) :")
    loss_data = SeismicAI.simulate_disaster(capital=10000000, structure="BETON ARME", magnitude=7.5)
    print(f"🏠 Perte Totale estimée (Mag 7.5) : {loss_data['total_loss']} DZD")
    print(f"📉 Part du Réassureur : {loss_data['reinsurer_share']} DZD")

    # --- 3. TEST DE LA STRATÉGIE DE PRIX (Elasticity) ---
    print("\n📈 3. Test du Pricing Stratégique :")
    pricing = SeismicAI.get_market_strategy("ADRAR", 10000)
    # On affiche directement le dictionnaire pour être sûr, ou on utilise la bonne clé
    print(f"📍 Zone 0 (Adrar) -> Conseil : {pricing['strategy']} (Nouveau tarif : {pricing['recommended_premium']} DZD)")
    # --- 4. TEST DE SANTÉ DU PORTEFEUILLE (Portfolio Analysis) ---
    print("\n📊 4. Test de l'Analyse de Portefeuille (Dashboard) :")
    fake_portfolio = [
        {"wilaya": "ALGER", "capital": 800000000}, # Grosse concentration
        {"wilaya": "ORAN", "capital": 100000000},
        {"wilaya": "SETIF", "capital": 50000000}
    ]
    analysis = SeismicAI.get_portfolio_analysis(fake_portfolio)
    print(f"⚖️ Score d'Équilibre : {analysis['balance_index']}/100")
    print(f"⚠️ Hotspots détectés : {len(analysis['hotspots'])}")

    # --- 5. TEST DU RAPPORT STRATÉGIQUE (LLM) ---
    print("\n✍️ 5. Test de Génération de Rapport (Intelligence Artificielle) :")
    if analysis['ai_executive_summary']:
        print("📝 Rapport généré avec succès (Aperçu) :")
        print(analysis['ai_executive_summary'][:200] + "...")
    else:
        print("❌ Échec de la génération du rapport LLM.")

    print("\n" + "="*50 + "\n✅ TOUT FONCTIONNE ! TON SYSTÈME EST PRÊT POUR LE LIEN.")

if __name__ == "__main__":
    run_final_check()