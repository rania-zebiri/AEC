"""
Hotspot Detection Service
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import date
from app.models.wilaya import Wilaya
from app.models.contract import Contract
from app.models.hotspot_snapshot import HotspotSnapshot
from app.models.retention_config import RetentionConfig
from app.services.pml_engine import PMLEngine
from app.core.logging import logger


class HotspotDetector:
    """Detects concentration hotspots per wilaya"""
    
    @classmethod
    def get_retention_capacity(cls, db: Session) -> float:
        """Get current retention capacity"""
        config = db.query(RetentionConfig).filter(
            RetentionConfig.config_key == "GLOBAL_RETENTION_CAPACITY"
        ).order_by(RetentionConfig.effective_from.desc()).first()
        
        if config:
            return float(config.config_value)
        return 1_000_000_000
    
    @classmethod
    def get_wilaya_exposure(cls, db: Session, wilaya_id: int) -> float:
        """Get total active capital in a wilaya"""
        result = db.query(func.sum(Contract.capital_assure)).filter(
            Contract.wilaya_id == wilaya_id,
            Contract.is_active == True
        ).scalar()
        return float(result) if result else 0
    
    @classmethod
    def get_all_wilayas_exposure(cls, db: Session) -> Dict[int, float]:
        """Get exposure for all wilayas"""
        results = db.query(
            Contract.wilaya_id,
            func.sum(Contract.capital_assure).label("total_capital")
        ).filter(Contract.is_active == True).group_by(Contract.wilaya_id).all()
        
        return {r.wilaya_id: float(r.total_capital) for r in results}
    
    @classmethod
    def create_snapshot(cls, db: Session, snapshot_date: date = None) -> List[HotspotSnapshot]:
        """Create hotspot snapshot for all wilayas"""
        
        if snapshot_date is None:
            snapshot_date = date.today()
        
        # Check if snapshot already exists
        existing = db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date == snapshot_date
        ).first()
        
        if existing:
            logger.info(f"Snapshot for {snapshot_date} already exists")
            return []
        
        retention_capacity = cls.get_retention_capacity(db)
        exposures = cls.get_all_wilayas_exposure(db)
        wilayas = db.query(Wilaya).all()
        
        snapshots = []
        for wilaya in wilayas:
            total_capital = exposures.get(wilaya.id, 0)
            is_hotspot = total_capital > retention_capacity
            excess_dzd = max(0, total_capital - retention_capacity)
            excess_pct = (excess_dzd / retention_capacity * 100) if retention_capacity > 0 else 0
            
            # Calculate PML for magnitude 6.5
            pml_result = PMLEngine.calculate_pml(db, wilaya.id, 6.5, None, None)
            
            snapshot = HotspotSnapshot(
                wilaya_id=wilaya.id,
                snapshot_date=snapshot_date,
                total_capital_dzd=total_capital,
                contract_count=db.query(func.count(Contract.id)).filter(
                    Contract.wilaya_id == wilaya.id,
                    Contract.is_active == True
                ).scalar() or 0,
                is_hotspot=is_hotspot,
                excess_dzd=excess_dzd,
                excess_pct=round(excess_pct, 2),
                retention_capacity_dzd=retention_capacity,
                pml_mag65_dzd=pml_result["expected_loss_dzd"]
            )
            
            db.add(snapshot)
            snapshots.append(snapshot)
        
        db.commit()
        logger.info(f"Created {len(snapshots)} hotspot snapshots for {snapshot_date}")
        
        return snapshots
    
    @classmethod
    def get_current_hotspots(cls, db: Session) -> List[Dict[str, Any]]:
        """Get current hotspots"""
        
        today = date.today()
        snapshots = db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date == today,
            HotspotSnapshot.is_hotspot == True
        ).all()
        
        if not snapshots:
            # Create snapshot if none exists for today
            cls.create_snapshot(db, today)
            snapshots = db.query(HotspotSnapshot).filter(
                HotspotSnapshot.snapshot_date == today,
                HotspotSnapshot.is_hotspot == True
            ).all()
        
        result = []
        for snapshot in snapshots:
            wilaya = db.query(Wilaya).filter(Wilaya.id == snapshot.wilaya_id).first()
            if wilaya:
                result.append({
                    "wilaya_id": snapshot.wilaya_id,
                    "wilaya_name": wilaya.name_fr,
                    "wilaya_code": wilaya.code,
                    "rpa_zone": wilaya.rpa_zone,
                    "total_capital_dzd": float(snapshot.total_capital_dzd),
                    "retention_capacity_dzd": float(snapshot.retention_capacity_dzd),
                    "excess_dzd": float(snapshot.excess_dzd),
                    "excess_pct": float(snapshot.excess_pct),
                    "contract_count": snapshot.contract_count,
                    "pml_mag65_dzd": float(snapshot.pml_mag65_dzd) if snapshot.pml_mag65_dzd else 0
                })
        
        return sorted(result, key=lambda x: x["excess_pct"], reverse=True)