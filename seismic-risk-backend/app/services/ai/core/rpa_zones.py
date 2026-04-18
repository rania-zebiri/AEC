def get_zone_by_location(wilaya: str, commune: str = None) -> str:
    """
    Official RPA 99 / Version 2003 Seismic Zoning.
    Based on Annexe 1 (Pages 11-14) of the provided DTR.
    """
    w = wilaya.strip().upper()
    c = commune.strip().upper() if commune else ""

    # Comprehensive RPA 99 Map
    rpa_map = {
        # ZONE 0: Négligeable
        "ADRAR": "0", "BECHAR": "0", "TAMANRASSET": "0", "OUARGLA": "0", 
        "ILLIZI": "0", "TINDOUF": "0", "EL OUED": "0", "GHARDAIA": "0",

        # ZONE I: Faible
        "LAGHOUAT": "I", "OUM EL BOUAGHI": "I", "BATNA": "I", "BISKRA": "I", 
        "TEBESSA": "I", "TLEMCEN": "I", "TIARET": "I", "DJELFA": "I", 
        "SAIDA": "I", "SIDI BEL ABBES": "I", "EL BAYADH": "I", "KHENCHELA": "I", 
        "SOUK AHRAS": "I", "NAAMA": "I",

        # ZONE IIa: Moyenne
        "BEJAIA": "IIa", "BOUIRA": "IIa", "JIJEL": "IIa", "SETIF": "IIa", 
        "SKIKDA": "IIa", "ANNABA": "IIa", "GUELMA": "IIa", "CONSTANTINE": "IIa", 
        "ORAN": "IIa", "EL TARF": "IIa", "TISSEMSILT": "IIa", "MILA": "IIa", 
        "AIN TEMOUCHENT": "IIa", "BORDJ BOU ARRERIDJ": "IIa",

        # ZONE IIb/III: Moyenne+/Elevée (Special cases below)
        "ALGER": "III",
        "TIPAZA": "III",
        "BOUMERDES": "III",
        "CHLEF": "III",
        "BLIDA": "III",
        "MEDEA": "IIb",
        "MOSTAGANEM": "IIa",
        "RELIZANE": "IIa",
        "MASCARA": "IIa",
        "TIZI OUZOU": "IIa",
        "M'SILA": "I",
        "AIN DEFLA": "IIa"
    }

    # Handle Special Communes that move a location into a higher or lower zone
    # Based on page 13 & 14 groupings (A, B, C)
    
    if w == "BOUMERDES":
        group_b = ["AFIR", "BENCHOUD", "TAOUERGA", "BAGHLIA", "OUED AISSA", "NACIRIA", 
                   "BORDJ MENAIL", "ISSER", "BENI AMRANE", "SOUK EL HAD", "BOUZEGZA KEDAR", 
                   "EL KHAROUBA", "LARBATACHE", "KHEMIS EL KHECHNA", "OULED MOUSSA", "HAMMADI"]
        group_c = ["TIMEZRIT", "AMMAL", "CHAABET EL AMEUR"]
        if c in group_b: return "IIb"
        if c in group_c: return "IIa"
        return "III"

    if w == "CHLEF":
        group_b = ["EL KARIMIA", "HARCHOUN", "SENDJAS", "OUED SLY", "BOUKADIR"]
        group_c = ["OULED BEN ABD EL KADER", "HADJADJ"]
        if c in group_b: return "IIb"
        if c in group_c: return "IIa"
        return "III"

    if w == "MEDEA":
        group_a = ["EL HAMDANIA", "MEDEA", "TAMESGUIDA"]
        group_c = ["BOU AICHE", "CHAHBOUNIA", "BOUGHZOUL", "SAREG", "MEFTAHA", 
                   "OULED MAREF", "EL AOUNET", "AIN BOUCIF", "SIDI DAMED", "AIN OUKSIR", "CHENIGUEL"]
        if c in group_a: return "III"
        if c in group_c: return "I"
        return "IIb"

    if w == "MOSTAGANEM":
        group_a = ["OULED BOUGHALEM", "ACHAACHA", "KHADRA", "NEKMARIA"]
        group_b = ["SIDI LAKHDAR", "TASGHAIT", "OULED MAALAH"]
        if c in group_a: return "III"
        if c in group_b: return "IIb"
        return "IIa"

    if w == "AIN DEFLA":
        group_a = ["TACHETA", "ZOUGAGHA", "EL ABADIA", "AIN BOUYAHIA", "EL ATTAF"]
        group_b = ["EL AMRA", "MEKHTARIA", "ARIB", "ROUINA", "AIN DEFLA", "BOURASHED", 
                   "ZEDDINE", "TIBERKANINE", "SEN ALLAH", "MELIANA", "AIN TORKI", 
                   "HAMMAM RIGHA", "AIN BENIAN", "HOUCEINIA", "BOUMADFAA"]
        if c in group_a: return "III"
        if c in group_b: return "IIb"
        return "IIa"

    return rpa_map.get(w, "Unknown")

def get_risk_level_description(zone: str) -> str:
    desc = {
        "0": "Sismicité négligeable (Sud Algérien)",
        "I": "Sismicité faible",
        "IIa": "Sismicité moyenne",
        "IIb": "Sismicité moyenne élevée",
        "III": "Sismicité élevée (Nord Algérien)"
    }
    return desc.get(zone, "Zone inconnue")