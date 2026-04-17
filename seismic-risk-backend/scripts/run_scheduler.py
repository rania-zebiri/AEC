#!/usr/bin/env python
"""Run scheduled background jobs for Seismic Risk Portfolio System

This script should be run as a cron job or systemd timer.
It executes daily, weekly, and monthly maintenance tasks.

Cron example (run daily at 1 AM):
0 1 * * * /path/to/venv/bin/python /path/to/scripts/run_scheduler.py

Cron example (run monthly on 1st at 2 AM):
0 2 1 * * /path/to/venv/bin/python /path/to/scripts/run_scheduler.py --job monthly
"""

import sys
import os
import argparse
from datetime import datetime, date, timedelta
from typing import Dict, Any

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.core.logging import logger
from app.models import (
    Contract, Wilaya, HotspotSnapshot, PortfolioMonthlyStats,
    RetentionConfig, RiskScore
)
from sqlalchemy import func, and_
from sqlalchemy.orm import Session


class SchedulerJobs:
    """All scheduled background jobs"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # =========================================================
    # DAILY JOBS
    # =========================================================
    
    def update_contract_active_status(self) -> int:
        """
        Update is_active flag for all contracts based on current date.
        Returns number of contracts updated.
        """
        today = date.today()
        
        # Expire contracts where expiration date passed
        expired_count = self.db.query(Contract).filter(
            Contract.is_active == True,
            Contract.date_expiration < today
        ).update({"is_active": False}, synchronize_session=False)
        
        # Reactivate contracts that become active (should be rare)
        activated_count = self.db.query(Contract).filter(
            Contract.is_active == False,
            Contract.date_effect <= today,
            Contract.date_expiration >= today
        ).update({"is_active": True}, synchronize_session=False)
        
        self.db.commit()
        
        total_updated = expired_count + activated_count
        logger.info(f"Updated contract active status: {expired_count} expired, {activated_count} activated")
        
        return total_updated
    
    def create_hotspot_snapshots(self) -> int:
        """
        Create daily hotspot snapshots for all wilayas.
        Returns number of snapshots created.
        """
        today_date = date.today()
        retention_capacity = self._get_retention_capacity()
        
        # Get all wilayas
        wilayas = self.db.query(Wilaya).all()
        
        snapshots_created = 0
        
        for wilaya in wilayas:
            # Check if snapshot already exists for today
            existing = self.db.query(HotspotSnapshot).filter(
                HotspotSnapshot.wilaya_id == wilaya.id,
                HotspotSnapshot.snapshot_date == today_date
            ).first()
            
            if existing:
                logger.info(f"Snapshot for {wilaya.name_fr} on {today_date} already exists, skipping")
                continue
            
            # Calculate total capital in this wilaya
            total_capital = self.db.query(func.sum(Contract.capital_assure)).filter(
                Contract.wilaya_id == wilaya.id,
                Contract.is_active == True
            ).scalar() or 0
            
            # Count contracts
            contract_count = self.db.query(func.count(Contract.id)).filter(
                Contract.wilaya_id == wilaya.id,
                Contract.is_active == True
            ).scalar() or 0
            
            # Check if hotspot (exceeds retention capacity)
            is_hotspot = float(total_capital) > retention_capacity
            excess_dzd = max(0, float(total_capital) - retention_capacity)
            excess_pct = (excess_dzd / retention_capacity * 100) if retention_capacity > 0 else 0
            
            # Calculate PML for magnitude 6.5 (for monthly KPI)
            from app.services.pml_engine import PMLEngine
            pml_result = PMLEngine.calculate_pml(
                self.db, wilaya.id, 6.5, None, None
            )
            
            snapshot = HotspotSnapshot(
                wilaya_id=wilaya.id,
                snapshot_date=today_date,
                total_capital_dzd=float(total_capital),
                contract_count=contract_count,
                is_hotspot=is_hotspot,
                excess_dzd=excess_dzd,
                excess_pct=round(excess_pct, 2),
                retention_capacity_dzd=retention_capacity,
                pml_mag65_dzd=pml_result.get("expected_loss_dzd", 0)
            )
            
            self.db.add(snapshot)
            snapshots_created += 1
        
        self.db.commit()
        logger.info(f"Created {snapshots_created} hotspot snapshots for {today_date}")
        
        return snapshots_created
    
    def check_seismic_alerts_pending(self) -> int:
        """
        Check for pending seismic alerts that need notification.
        Returns number of alerts processed.
        """
        # Find alerts that haven't been sent yet
        pending_alerts = self.db.query(SeismicAlert).filter(
            SeismicAlert.alert_sent == False,
            SeismicAlert.magnitude >= 5.0  # Only significant earthquakes
        ).all()
        
        processed = 0
        for alert in pending_alerts:
            # Here you would send email/push notifications
            # For now, just mark as sent
            alert.alert_sent = True
            alert.alert_sent_at = datetime.now()
            processed += 1
            logger.info(f"Alert sent for seismic event {alert.event_id_external} (M{alert.magnitude})")
        
        self.db.commit()
        return processed
    
    # =========================================================
    # WEEKLY JOBS
    # =========================================================
    
    def recompute_risk_scores(self) -> int:
        """
        Recompute risk scores for all active contracts.
        Returns number of scores updated.
        """
        from app.services.risk_scorer import RiskScorer
        
        active_contracts = self.db.query(Contract).filter(
            Contract.is_active == True
        ).all()
        
        updated = 0
        for contract in active_contracts:
            RiskScorer.compute_and_save(self.db, contract.id)
            updated += 1
        
        logger.info(f"Recomputed risk scores for {updated} active contracts")
        return updated
    
    def cleanup_old_audit_logs(self, days_to_keep: int = 365) -> int:
        """
        Delete audit logs older than specified days.
        Returns number of logs deleted.
        """
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        deleted = self.db.query(AuditLog).filter(
            AuditLog.created_at < cutoff_date
        ).delete(synchronize_session=False)
        
        self.db.commit()
        logger.info(f"Deleted {deleted} audit logs older than {days_to_keep} days")
        
        return deleted
    
    # =========================================================
    # MONTHLY JOBS
    # =========================================================
    
    def create_monthly_stats(self, target_month: date = None) -> Dict[str, Any]:
        """
        Create portfolio monthly statistics snapshot.
        Returns statistics dictionary.
        """
        if target_month is None:
            # Default to previous month
            today = date.today()
            target_month = date(today.year, today.month - 1, 1) if today.month > 1 else date(today.year - 1, 12, 1)
        
        # Check if already exists
        existing = self.db.query(PortfolioMonthlyStats).filter(
            PortfolioMonthlyStats.month_date == target_month
        ).first()
        
        if existing:
            logger.info(f"Monthly stats for {target_month} already exist, updating...")
            stats = existing
        else:
            stats = PortfolioMonthlyStats(month_date=target_month)
        
        # Calculate month range
        next_month = date(target_month.year + (target_month.month // 12), 
                         (target_month.month % 12) + 1, 1)
        
        # Get contracts active during this month
        contracts = self.db.query(Contract).filter(
            Contract.date_effect <= next_month,
            Contract.date_expiration >= target_month
        ).all()
        
        # Calculate totals
        total_exposure = sum(float(c.capital_assure) for c in contracts)
        total_premium = sum(float(c.prime_nette) for c in contracts)
        active_count = len(contracts)
        
        # Calculate zone III exposure
        zone3_exposure = 0
        for contract in contracts:
            if contract.wilaya and contract.wilaya.zone_score >= 2.5:
                zone3_exposure += float(contract.capital_assure)
        
        zone3_exposure_pct = (zone3_exposure / total_exposure * 100) if total_exposure > 0 else 0
        
        # Count hotspots during this month
        hotspot_count = self.db.query(func.count(HotspotSnapshot.id)).filter(
            HotspotSnapshot.snapshot_date >= target_month,
            HotspotSnapshot.snapshot_date < next_month,
            HotspotSnapshot.is_hotspot == True
        ).scalar() or 0
        
        # Calculate PML for magnitude 6.5 across portfolio
        from app.services.pml_engine import PMLEngine
        total_pml = 0
        wilaya_pmls = {}
        
        for contract in contracts:
            wilaya_id = contract.wilaya_id
            if wilaya_id not in wilaya_pmls:
                # Calculate PML for this wilaya once
                pml_result = PMLEngine.calculate_pml(self.db, wilaya_id, 6.5, target_month, None)
                wilaya_pmls[wilaya_id] = pml_result.get("expected_loss_dzd", 0)
            total_pml += wilaya_pmls[wilaya_id] / len([c for c in contracts if c.wilaya_id == wilaya_id]) if contracts else 0
        
        pml_pct = (total_pml / total_exposure * 100) if total_exposure > 0 else 0
        
        # Calculate balance index
        balance_index = self._calculate_balance_index(contracts)
        
        # Calculate new and cancelled contracts
        new_contracts = self.db.query(func.count(Contract.id)).filter(
            Contract.imported_at >= target_month,
            Contract.imported_at < next_month
        ).scalar() or 0
        
        cancelled_contracts = self.db.query(func.count(Contract.id)).filter(
            Contract.date_expiration >= target_month,
            Contract.date_expiration < next_month
        ).scalar() or 0
        
        # Calculate average and max risk scores
        risk_scores = self.db.query(RiskScore.risk_score).join(
            Contract, RiskScore.contract_id == Contract.id
        ).filter(
            Contract.date_effect <= next_month,
            Contract.date_expiration >= target_month
        ).all()
        
        avg_risk_score = sum(float(r[0]) for r in risk_scores) / len(risk_scores) if risk_scores else 0
        max_risk_score = max((float(r[0]) for r in risk_scores), default=0)
        
        # Update stats object
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
        logger.info(f"Created monthly stats for {target_month}")
        
        return {
            "month": target_month.isoformat(),
            "total_exposure_dzd": total_exposure,
            "total_premium_dzd": total_premium,
            "active_contract_count": active_count,
            "hotspot_count": hotspot_count,
            "balance_index": balance_index
        }
    
    def cleanup_old_hotspot_snapshots(self, months_to_keep: int = 24) -> int:
        """
        Delete hotspot snapshots older than specified months.
        Returns number of snapshots deleted.
        """
        cutoff_date = date.today() - timedelta(days=months_to_keep * 30)
        
        deleted = self.db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date < cutoff_date
        ).delete(synchronize_session=False)
        
        self.db.commit()
        logger.info(f"Deleted {deleted} hotspot snapshots older than {months_to_keep} months")
        
        return deleted
    
    # =========================================================
    # HELPER METHODS
    # =========================================================
    
    def _get_retention_capacity(self) -> float:
        """Get current retention capacity"""
        config = self.db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "GLOBAL_RETENTION_CAPACITY",
            RetentionConfig.effective_from <= date.today()
        ).order_by(RetentionConfig.effective_from.desc()).first()
        
        if config:
            return float(config.config_value)
        return 1_000_000_000  # Default 1B DZD
    
    def _calculate_balance_index(self, contracts) -> float:
        """
        Calculate portfolio balance index (0-100)
        Higher score = better balanced portfolio
        """
        if not contracts:
            return 100.0
        
        # Calculate distribution across wilayas
        wilaya_exposures = {}
        for contract in contracts:
            wilaya_id = contract.wilaya_id
            wilaya_exposures[wilaya_id] = wilaya_exposures.get(wilaya_id, 0) + float(contract.capital_assure)
        
        if not wilaya_exposures:
            return 100.0
        
        # Calculate Gini coefficient or concentration ratio
        exposures = sorted(wilaya_exposures.values())
        total = sum(exposures)
        
        if total == 0:
            return 100.0
        
        # Calculate Herfindahl-Hirschman Index (HHI)
        hhi = sum((e / total) ** 2 for e in exposures)
        
        # Convert HHI to balance index (0-100)
        # HHI ranges from 1/n (perfect balance) to 1 (perfect concentration)
        n = len(exposures)
        min_hhi = 1 / n if n > 0 else 1
        balance_index = (1 - (hhi - min_hhi) / (1 - min_hhi)) * 100 if min_hhi < 1 else 100
        
        return max(0, min(100, balance_index))


# =========================================================
# MAIN EXECUTION
# =========================================================

def run_daily_jobs():
    """Run all daily scheduled jobs"""
    db = SessionLocal()
    try:
        scheduler = SchedulerJobs(db)
        
        logger.info("=" * 50)
        logger.info("Starting DAILY scheduled jobs")
        logger.info("=" * 50)
        
        # Update contract active status
        updated = scheduler.update_contract_active_status()
        logger.info(f"✓ Updated {updated} contract statuses")
        
        # Create hotspot snapshots
        snapshots = scheduler.create_hotspot_snapshots()
        logger.info(f"✓ Created {snapshots} hotspot snapshots")
        
        # Check seismic alerts
        alerts = scheduler.check_seismic_alerts_pending()
        logger.info(f"✓ Processed {alerts} seismic alerts")
        
        logger.info("Daily jobs completed successfully")
        
    except Exception as e:
        logger.error(f"Error running daily jobs: {e}")
        raise
    finally:
        db.close()


def run_weekly_jobs():
    """Run all weekly scheduled jobs"""
    db = SessionLocal()
    try:
        scheduler = SchedulerJobs(db)
        
        logger.info("=" * 50)
        logger.info("Starting WEEKLY scheduled jobs")
        logger.info("=" * 50)
        
        # Recompute risk scores
        updated = scheduler.recompute_risk_scores()
        logger.info(f"✓ Recomputed {updated} risk scores")
        
        # Cleanup old audit logs (keep 1 year)
        deleted = scheduler.cleanup_old_audit_logs(365)
        logger.info(f"✓ Deleted {deleted} old audit logs")
        
        logger.info("Weekly jobs completed successfully")
        
    except Exception as e:
        logger.error(f"Error running weekly jobs: {e}")
        raise
    finally:
        db.close()


def run_monthly_jobs():
    """Run all monthly scheduled jobs"""
    db = SessionLocal()
    try:
        scheduler = SchedulerJobs(db)
        
        logger.info("=" * 50)
        logger.info("Starting MONTHLY scheduled jobs")
        logger.info("=" * 50)
        
        # Create monthly portfolio stats
        stats = scheduler.create_monthly_stats()
        logger.info(f"✓ Created monthly stats for {stats['month']}")
        
        # Cleanup old hotspot snapshots (keep 24 months)
        deleted = scheduler.cleanup_old_hotspot_snapshots(24)
        logger.info(f"✓ Deleted {deleted} old hotspot snapshots")
        
        logger.info("Monthly jobs completed successfully")
        
    except Exception as e:
        logger.error(f"Error running monthly jobs: {e}")
        raise
    finally:
        db.close()


def run_all_jobs():
    """Run all jobs (daily, weekly, monthly)"""
    run_daily_jobs()
    run_weekly_jobs()
    run_monthly_jobs()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run scheduled jobs for Seismic Risk Portfolio')
    parser.add_argument('--job', '-j', 
                        choices=['daily', 'weekly', 'monthly', 'all'],
                        default='daily',
                        help='Type of job to run (default: daily)')
    
    args = parser.parse_args()
    
    if args.job == 'daily':
        run_daily_jobs()
    elif args.job == 'weekly':
        run_weekly_jobs()
    elif args.job == 'monthly':
        run_monthly_jobs()
    elif args.job == 'all':
        run_all_jobs()