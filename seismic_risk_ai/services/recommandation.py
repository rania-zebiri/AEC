def generate_acaps_report_data(portfolio_data):
    import pandas as pd

    df = pd.DataFrame(portfolio_data)

    if df.empty:
        return {}

    # Total exposure
    total_exposure = df["capital"].sum()

    # High risk (AI)
    high_risk_df = df[df["risk_label"] == "HIGH RISK"]
    high_risk_exposure = high_risk_df["capital"].sum()

    percentage_high_risk = (
        (high_risk_exposure / total_exposure) * 100 if total_exposure > 0 else 0
    )

    # Top wilayas
    wilaya_group = df.groupby("wilaya")["capital"].sum().sort_values(ascending=False)
    top_wilayas = wilaya_group.head(2).index.tolist()

    return {
        "total_exposure": total_exposure,
        "high_risk_percentage": round(percentage_high_risk, 2),
        "top_wilayas": top_wilayas,
        "num_contracts": len(df)
    }

def generate_acaps_text(report_data):
    return f"""
Rapport Réglementaire d’Exposition au Risque Sismique

1. Distribution Géographique des Risques
L'exposition totale s'élève à {report_data['total_exposure']:,} DZD.
Les zones à haut risque représentent {report_data['high_risk_percentage']}% de l’engagement global.

3. Analyse de Concentration
Les wilayas {", ".join(report_data['top_wilayas'])} concentrent la majorité de l'exposition.

"""