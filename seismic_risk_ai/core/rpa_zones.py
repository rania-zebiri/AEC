"""
OFFICIAL RPA 99 / VERSION 2003 ZONING
Zone 0  : Negligible sismicitiy
Zone I  : Low sismicity
Zone IIa: Moderate sismicity
Zone IIb: Medium sismicity
Zone III: High sismicity
"""

WILAYA_TO_ZONE = {
    "ADRAR": "0", "CHLEF": "III", "LAGHOUAT": "I", "OUM EL BOUAGHI": "I",
    "BATNA": "I", "BEJAIA": "IIb", "BISKRA": "I", "BECHAR": "0",
    "BLIDA": "III", "BOUIRA": "IIa", "TAMANRASSET": "0", "TEBESSA": "I",
    "TLEMCEN": "I", "TIARET": "I", "TIZI OUZOU": "IIb", "ALGER": "III",
    "DJELFA": "I", "JIJEL": "IIb", "SETIF": "IIa", "SAIDA": "I",
    "SKIKDA": "IIb", "SIDI BEL ABBES": "I", "ANNABA": "IIa", "GUELMA": "IIa",
    "CONSTANTINE": "IIa", "MEDEA": "IIb", "MOSTAGANEM": "IIa", "MSILA": "IIa",
    "MASCARA": "IIa", "OUARGLA": "0", "ORAN": "IIa", "EL BAYADH": "I",
    "ILLIZI": "0", "BORDJ BOU ARRERIDJ": "IIa", "BOUMERDES": "III", "EL TARF": "IIb",
    "TINDOUF": "0", "TISSEMSSILT": "IIa", "EL OUED": "0", "KHENCHELA": "I",
    "SOUK AHRAS": "I", "TIPAZA": "III", "MILA": "IIa", "AIN DEF LA": "IIb",
    "NAAMA": "I", "AIN TEMOUCHENT": "IIa", "GHARDAIA": "0", "RELIZANE": "IIa"
}

def get_zone_by_wilaya(wilaya_name: str) -> str:
    """
    Returns the RPA Zone (0, I, IIa, IIb, III) for a given wilaya.
    Handles case sensitivity and extra spaces.
    """
    clean_name = wilaya_name.strip().upper()
    
    # Handle common spelling variations
    if clean_name == "ALGIERS": clean_name = "ALGER"
    if clean_name == "AIN DEFLA": clean_name = "AIN DEF LA"
    
    return WILAYA_TO_ZONE.get(clean_name, "Unknown")

def get_risk_level_description(zone: str) -> str:
    """Returns a text description of the risk for the UI."""
    descriptions = {
        "0": "Négligeable",
        "I": "Faible",
        "IIa": "Moyenne",
        "IIb": "Élevée",
        "III": "Très Élevée"
    }
    return descriptions.get(zone, "Inconnu")