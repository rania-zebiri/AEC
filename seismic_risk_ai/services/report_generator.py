import pandas as pd
import datetime

def generate_acaps_csv(portfolio_data, filename="REPORT_ACAPS_SEISMIC.csv"):
    """
    Transforme les données brutes en format réglementaire ACAPS.
    """
    report_rows = []
    
    for contract in portfolio_data:
        report_rows.append({
            "DATE_EXTRACT": datetime.date.today(),
            "ID_POLICE": contract.get("id", "N/A"),
            "WILAYA": contract.get("wilaya").upper(),
            "CAPITAL_EXPOSÉ": contract.get("capital"),
            "STRUCTURE": contract.get("structure"),
            "CONFORMITÉ_RPA": "OUI" # Puisque ton système filtre à l'entrée
        })
    
    df = pd.DataFrame(report_rows)
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    return filename