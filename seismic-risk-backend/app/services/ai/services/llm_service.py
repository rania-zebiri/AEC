from groq import Groq
from app.services.ai.config import GROQ_API_KEY, MODEL_NAME
client = Groq(api_key=GROQ_API_KEY)

def generate_strategic_report(portfolio_health: float, hotspots: list) -> str:
    """
    Uses Free LLM to generate a professional French recommendation note.
    """
    hotspot_names = ", ".join([h['wilaya'] for h in hotspots])
    
    prompt = f"""
    Tu es un expert en réassurance sismique en Algérie. 
    Analyse les données suivantes et rédige une note de synthèse professionnelle :
    1. Score de santé du portefeuille : {portfolio_health}/100.
    2. Points chauds détectés : {hotspot_names if hotspots else 'Aucun'}.
    
    Structure de la note :
    - Constat global
    - Analyse de la concentration
    - Recommandations stratégiques (Réassurance, suspension de souscription)
    Rédige en Français professionnel.
    """

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Erreur lors de la génération du rapport : {str(e)}"