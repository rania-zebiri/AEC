import httpx
import json
import hashlib
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.ai_report import AIReport
from app.core.logging import logger


class ClaudeService:
    """Simple LLM API using HTTPX (no extra packages)"""
    
    @classmethod
    def _call_llm(cls, prompt: str) -> str:
        """Call Groq API directly with HTTPX"""
        
        if not settings.GROQ_API_KEY:
            return "Clé API non configurée"
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {
            "model": settings.GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 500
        }
        
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, headers=headers, json=data)
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(f"API Error: {response.status_code}")
                    return f"Erreur API: {response.status_code}"
        except Exception as e:
            logger.error(f"Error: {e}")
            return f"Erreur: {str(e)}"
    
    @classmethod
    def generate_underwriting_narrative_sync(cls, db: Session, result: Dict) -> str:
        """Generate explanation for underwriting"""
        prompt = f"""Explique cette décision en 2-3 phrases en français:
        Décision: {result.get('decision')}
        Raison: {result.get('reason_fr')}
        Score: {result.get('risk_score')}/100"""
        return cls._call_llm(prompt)
    
    @classmethod
    def generate_pml_narrative_sync(cls, db: Session, sim_id: int, pml_result: Dict) -> str:
        """Generate explanation for PML"""
        prompt = f"""Explique ce résultat PML en 2-3 phrases en français:
        Wilaya: {pml_result.get('wilaya_name')}
        Magnitude: {pml_result.get('magnitude')}
        Perte: {pml_result.get('expected_loss_dzd'):,.0f} DZD"""
        return cls._call_llm(prompt)
    
    @classmethod
    def generate_strategic_recommendation(cls, db: Session, stats: Dict, user_id=None) -> str:
        """Generate strategic report"""
        prompt = f"""Génère un rapport stratégique court en français:
        Exposition: {stats.get('total_exposure_dzd', 0):,.0f} DZD
        Contrats: {stats.get('active_contract_count', 0)}
        PML: {stats.get('pml_mag65_dzd', 0):,.0f} DZD"""
        return cls._call_llm(prompt)