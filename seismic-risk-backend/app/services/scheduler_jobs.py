"""
Scheduled Background Jobs
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import Dict, Any
from app.core.logging import logger
from app.models import Contract, Wilaya, HotspotSnapshot, PortfolioMonthlyStats, RetentionConfig, RiskScore, AuditLog
from app.services.hotspot_detector import HotspotDetector
from app.services.risk_scorer import RiskScorer
from app.services.balance_index import BalanceIndexCalculator
from app.services.pml_engine import PMLEngine


class SchedulerJobs:
    """All scheduled background jobs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =========================================================
    # DAILY JOBS
    # =========================================================
    
    def update_contract_active_status(self) -> int:
        """Update is_active flag for all contracts"""
        today = date.today()
        
        expired_count = self.db.query(Contract).filter(
            Contract.is_active == True,
            Contract.date_expiration < today
        ).update({"is_active": False}, synchronize_session=False)
        
        activated_count = self.db.query(Contract).filter(
            Contract.is_active == False,
            Contract.date_effect <= today,
            Contract.date_expiration >= today
        ).update({"is_active": True}, synchronize_session=False)
        
        self.db.commit()
        logger.info(f"Updated: {expired_count} expired, {activated_count} activated")
        return expired_count + activated_count
    
    def create_hotspot_snapshots(self) -> int:
        """Create daily hotspot snapshots"""
        snapshots = HotspotDetector.create_snapshot(self.db)
        return len(snapshots)
    
    # =========================================================
    # WEEKLY JOBS
    # =========================================================
    
    def recompute_risk_scores(self) -> int:
        """Recompute risk scores for all active contracts"""
        return RiskScorer.compute_all_active(self.db)
    
    def cleanup_old_audit_logs(self, days_to_keep: int = 365) -> int:
        """Delete old audit logs"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        deleted = self.db.query(AuditLog).filter(
            AuditLog.created_at < cutoff_date
        ).delete(synchronize_session=False)
        self.db.commit()
        logger.info(f"Deleted {deleted} old audit logs")
        return deleted
    
    # =========================================================
    # MONTHLY JOBS
    # =========================================================
    
    def create_monthly_stats(self, target_month: date = None) -> Dict[str, Any]:
        """Create portfolio monthly statistics snapshot"""
        
        if target_month is None:
            today = date.today()
            target_month = date(today.year, today.month - 1, 1) if today.month > 1 else date(today.year - 1, 12, 1)
        
        existing = self.db.query(PortfolioMonthlyStats).filter(
            PortfolioMonthlyStats.month_date == target_month
        ).first()
        
        if existing:
            stats = existing
        else:
            stats = PortfolioMonthlyStats(month_date=target_month)
        
        next_month = date(target_month.year + (target_month.month // 12), 
                         (target_month.month % 12) + 1, 1)
        
        contracts = self.db.query(Contract).filter(
            Contract.date_effect <= next_month,
            Contract.date_expiration >= target_month
        ).all()
        
        total_exposure = sum(float(c.capital_assure) for c in contracts)
        total_premium = sum(float(c.prime_nette) for c in contracts)
        active_count = len(contracts)
        
        # Zone III exposure
        zone3_exposure = 0
        for contract in contracts:
            if contract.wilaya and contract.wilaya.zone_score >= 2.5:
                zone3_exposure += float(contract.capital_assure)
        zone3_exposure_pct = (zone3_exposure / total_exposure * 100) if total_exposure > 0 else 0
        
        # Hotspot count
        hotspot_count = self.db.query(func.count(HotspotSnapshot.id)).filter(
            HotspotSnapshot.snapshot_date >= target_month,
            HotspotSnapshot.snapshot_date < next_month,
            HotspotSnapshot.is_hotspot == True
        ).scalar() or 0
        
        # Calculate PML
        total_pml = 0
        wilaya_pmls = {}
        for contract in contracts:
            if contract.wilaya_id not in wilaya_pmls:
                pml_result = PMLEngine.calculate_pml(self.db, contract.wilaya_id, 6.5, target_month, None)
                wilaya_pmls[contract.wilaya_id] = pml_result.get("expected_loss_dzd", 0)
        
        if wilaya_pmls:
            # Average PML per contract (simplified)
            total_pml = sum(wilaya_pmls.values())
        
        pml_pct = (total_pml / total_exposure * 100) if total_exposure > 0 else 0
        
        # Balance index
        exposures = [float(c.capital_assure) for c in contracts]
        balance_index = BalanceIndexCalculator.calculate(exposures)
        
        # New and cancelled contracts
        new_contracts = self.db.query(func.count(Contract.id)).filter(
            Contract.imported_at >= target_month,
            Contract.imported_at < next_month
        ).scalar() or 0
        
        cancelled_contracts = self.db.query(func.count(Contract.id)).filter(
            Contract.date_expiration >= target_month,
            Contract.date_expiration < next_month
        ).scalar() or 0
        
        # Risk scores
        risk_scores = self.db.query(RiskScore.risk_score).join(
            Contract, RiskScore.contract_id == Contract.id
        ).filter(
            Contract.date_effect <= next_month,
            Contract.date_expiration >= target_month
        ).all()
        
        avg_risk_score = sum(float(r[0]) for r in risk_scores) / len(risk_scores) if risk_scores else 0
        max_risk_score = max((float(r[0]) for r in risk_scores), default=0)
        
        stats.total_exposure_dzd = total_exposure
        stats.total_premium_dzd = total_premium
        stats.active_contract_count = active_count
        stats.hotspot_count = hotspot_count
        stats.zone3_exposure_dzd = zone3_exposure
        stats.zone3_exposure_pct = round(zone3_exposure_pct, 2)
        stats.pml_mag65_dzd = total_pml
        stats.pml_mag65_pct_of_exposure = round(pml_pct, 2)
        stats.balance_index = round(balance_index, 1)
        stats.new_contracts_count = new_contracts
        stats.cancelled_contracts_count = cancelled_contracts
        stats.avg_risk_score = round(avg_risk_score, 1)
        stats.max_risk_score = round(max_risk_score, 1)
        stats.computed_at = datetime.now()
        
        if not existing:
            self.db.add(stats)
        
        self.db.commit()
        
        return {
            "month": target_month.isoformat(),
            "total_exposure_dzd": total_exposure,
            "active_contract_count": active_count,
            "balance_index": balance_index
        }
    
    def cleanup_old_hotspot_snapshots(self, months_to_keep: int = 24) -> int:
        """Delete old hotspot snapshots"""
        cutoff_date = date.today() - timedelta(days=months_to_keep * 30)
        deleted = self.db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date < cutoff_date
        ).delete(synchronize_session=False)
        self.db.commit()
        return deleted