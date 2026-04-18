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
            try:
                pml_result = PMLEngine.calculate_pml(db, wilaya.id, 6.5, None, None)
                pml_value = pml_result["expected_loss_dzd"] if pml_result else 0
            except:
                pml_value = 0
            
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
                pml_mag65_dzd=pml_value
            )
            
            db.add(snapshot)
            snapshots.append(snapshot)
        
        db.commit()
        logger.info(f"Created {len(snapshots)} hotspot snapshots for {snapshot_date}")
        
        return snapshots
    
    @classmethod
    def get_current_hotspots(cls, db: Session) -> Dict[str, Any]:
        """Get current hotspots, warnings and safe wilayas"""
        
        today = date.today()
        retention_capacity = cls.get_retention_capacity(db)
        
        # Get or create snapshot for today
        snapshots = db.query(HotspotSnapshot).filter(
            HotspotSnapshot.snapshot_date == today
        ).all()
        
        if not snapshots:
            cls.create_snapshot(db, today)
            snapshots = db.query(HotspotSnapshot).filter(
                HotspotSnapshot.snapshot_date == today
            ).all()
        
        hotspots = []
        warnings = []
        safe_wilayas = []
        
        for snapshot in snapshots:
            wilaya = db.query(Wilaya).filter(Wilaya.id == snapshot.wilaya_id).first()
            if not wilaya:
                continue
                
            exposure = float(snapshot.total_capital_dzd)
            usage_pct = (exposure / retention_capacity * 100) if retention_capacity > 0 else 0
            
            wilaya_data = {
                "id": snapshot.wilaya_id,
                "name": wilaya.name_fr,
                "code": wilaya.code,
                "zone": wilaya.rpa_zone,
                "capacity": retention_capacity,
                "exposure": exposure,
                "usage_pct": round(usage_pct, 1),
                "contract_count": snapshot.contract_count,
                "pml_mag65_dzd": float(snapshot.pml_mag65_dzd) if snapshot.pml_mag65_dzd else 0
            }
            
            # Classification
            if usage_pct >= 100:
                # Hotspot
                hotspots.append({
                    **wilaya_data,
                    "res": exposure * 0.5,
                    "com": exposure * 0.3,
                    "ind": exposure * 0.2,
                    "score": min(100, int(50 + usage_pct * 0.5))
                })
            elif usage_pct >= 75:
                # Warning
                warnings.append({
                    **wilaya_data,
                    "score": int(40 + usage_pct * 0.3)
                })
            else:
                # Safe
                safe_wilayas.append(wilaya_data)
        
        # Trier par exposition
        hotspots.sort(key=lambda x: x["exposure"], reverse=True)
        warnings.sort(key=lambda x: x["exposure"], reverse=True)
        safe_wilayas.sort(key=lambda x: x["exposure"], reverse=True)
        
        return {
            "hotspots": hotspots,
            "warnings": warnings,
            "safe_wilayas": safe_wilayas,
            "global_capacity": retention_capacity,
            "stats": {
                "safe": len(safe_wilayas),
                "warning": len(warnings),
                "hotspot": len(hotspots)
            },
            "last_updated": today.isoformat()
        }