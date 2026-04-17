"""
LLM API Integration for AI Features (Synchronous - for Llama/Ollama)
"""
import json
import hashlib
import requests
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.models.ai_report import AIReport
from app.core.logging import logger


class ClaudeService:
    """LLM API integration for AI features (synchronous - works with Llama)"""
    
    # Ollama default endpoint
    LLAMA_API_URL = getattr(settings, 'LLAMA_API_URL', "http://localhost:11434/api/generate")
    LLAMA_MODEL = getattr(settings, 'LLAMA_MODEL', "llama2")
    
    @classmethod
    def _get_cache_key(cls, report_type: str, input_data: Dict) -> str:
        """Generate SHA-256 hash for cache lookup"""
        content = json.dumps(input_data, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()
    
    @classmethod
    def _check_cache(cls, db: Session, report_type: str, input_hash: str) -> Optional[str]:
        """Check if report exists in cache"""
        cached = db.query(AIReport).filter(
            AIReport.report_type == report_type,
            AIReport.input_hash == input_hash,
            AIReport.is_valid == True
        ).first()
        return cached.report_text if cached else None
    
    @classmethod
    def _save_report(cls, db: Session, report_type: str, report_text: str, 
                     input_hash: str, input_data: Dict, user_id: Optional[int] = None):
        """Save report to database"""
        report = AIReport(
            report_type=report_type,
            report_text=report_text,
            input_hash=input_hash,
            input_snapshot_json=input_data,
            generated_by_user_id=user_id,
            is_valid=True
        )
        db.add(report)
        db.commit()
        return report
    
    @classmethod
    def _call_llm(cls, prompt: str, model: str = None) -> str:
        """Call LLM via Ollama API (synchronous)"""
        model = model or cls.LLAMA_MODEL
        
        try:
            response = requests.post(
                cls.LLAMA_API_URL,
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "temperature": 0.3,
                    "max_tokens": 1000
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "")
            else:
                logger.error(f"LLM API error: {response.status_code} - {response.text}")
                return ""
                
        except requests.exceptions.ConnectionError:
            logger.error(f"Cannot connect to LLM API at {cls.LLAMA_API_URL}")
            return "Service LLM non disponible. Veuillez réessayer plus tard."
        except Exception as e:
            logger.error(f"LLM API error: {e}")
            return ""
    
    @classmethod
    def generate_strategic_recommendation(
        cls, 
        db: Session, 
        portfolio_stats: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> str:
        """Generate strategic recommendation note using LLM"""
        
        report_type = "RECOMMENDATION"
        input_hash = cls._get_cache_key(report_type, portfolio_stats)
        
        # Check cache
        cached = cls._check_cache(db, report_type, input_hash)
        if cached:
            logger.info("Returning cached strategic recommendation")
            return cached
        
        # Prepare prompt
        prompt = f"""En tant qu'expert en gestion des risques sismiques pour un portefeuille d'assurance en Algérie, 
générez une note de recommandation stratégique basée sur les données suivantes:

Données du portefeuille:
- Exposition totale: {portfolio_stats.get('total_exposure_dzd', 0):,.0f} DZD
- Prime totale: {portfolio_stats.get('total_premium_dzd', 0):,.0f} DZD
- Nombre de contrats actifs: {portfolio_stats.get('active_contract_count', 0)}
- Nombre de wilayas hotspots: {portfolio_stats.get('hotspot_count', 0)}
- Exposition Zone III: {portfolio_stats.get('zone3_exposure_pct', 0)}%
- PML magnitude 6.5: {portfolio_stats.get('pml_mag65_dzd', 0):,.0f} DZD
- Balance Index: {portfolio_stats.get('balance_index', 0)}/100
- Score de risque moyen: {portfolio_stats.get('avg_risk_score', 0)}/100

Veuillez fournir:
1. Un résumé exécutif (2-3 phrases)
2. Principaux risques identifiés
3. Recommandations d'action (3-5 points)
4. Priorités pour les 3 prochains mois

Répondez en français, dans un ton professionnel et direct."""
        
        report_text = cls._call_llm(prompt)
        
        if not report_text:
            report_text = "Rapport non disponible. Veuillez réessayer."
        
        # Save to cache
        cls._save_report(db, report_type, report_text, input_hash, portfolio_stats, user_id)
        
        return report_text
    
    @classmethod
    def generate_underwriting_narrative_sync(
        cls,
        db: Session,
        evaluation_result: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> str:
        """Generate narrative explanation for underwriting decision (synchronous)"""
        
        prompt = f"""En tant qu'assistant souscription, expliquez la décision suivante à un courtier:

Décision: {evaluation_result.get('decision')}
Raison: {evaluation_result.get('reason_fr')}
Score de risque: {evaluation_result.get('risk_score')}/100

Rédigez une explication professionnelle en français (2-3 phrases) pour le courtier.
Soyez courtois et constructif."""
        
        return cls._call_llm(prompt)
    
    @classmethod
    def generate_pml_narrative_sync(
        cls,
        db: Session,
        simulation_id: int,
        pml_result: Dict[str, Any],
        user_id: Optional[int] = None
    ) -> str:
        """Generate narrative for PML simulation (synchronous)"""
        
        prompt = f"""En tant qu'expert en risque sismique, expliquez ce scénario:

Wilaya: {pml_result.get('wilaya_name')}
Magnitude: {pml_result.get('magnitude')}
Perte attendue: {pml_result.get('expected_loss_dzd'):,.0f} DZD
Perte nette après réassurance: {pml_result.get('net_company_loss_dzd'):,.0f} DZD
Ratio de perte: {pml_result.get('loss_ratio_pct')}%

Rédigez une explication en français (3-4 phrases) pour le gestionnaire de risques."""
        
        narrative = cls._call_llm(prompt)
        
        # Save narrative to simulation
        from app.models.pml_simulation import PMLSimulation
        simulation = db.query(PMLSimulation).filter(PMLSimulation.id == simulation_id).first()
        if simulation:
            simulation.ai_narrative = narrative
            db.commit()
        
        return narrative