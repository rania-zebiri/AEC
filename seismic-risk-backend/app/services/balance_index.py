"""
Portfolio Balance Index Calculator
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.models.contract import Contract
from app.models.wilaya import Wilaya


class BalanceIndexCalculator:
    """
    Calculates portfolio balance index (0-100)
    Higher score = better balanced portfolio across wilayas
    """
    
    @classmethod
    def calculate(cls, exposures: List[float]) -> float:
        """
        Calculate balance index using Herfindahl-Hirschman Index (HHI)
        
        Args:
            exposures: List of exposure values per wilaya
            
        Returns:
            Balance index from 0 to 100 (higher = more balanced)
        """
        if not exposures:
            return 100.0
        
        total = sum(exposures)
        if total == 0:
            return 100.0
        
        # Calculate HHI (sum of squares of market shares)
        hhi = sum((e / total) ** 2 for e in exposures)
        
        # Number of wilayas
        n = len(exposures)
        
        # Minimum possible HHI (perfect balance)
        min_hhi = 1 / n if n > 0 else 1
        
        # Maximum possible HHI (perfect concentration)
        max_hhi = 1.0
        
        # Convert to balance index (0-100)
        if min_hhi >= max_hhi:
            balance_index = 100.0
        else:
            balance_index = (1 - (hhi - min_hhi) / (max_hhi - min_hhi)) * 100
        
        return max(0, min(100, balance_index))
    
    @classmethod
    def calculate_from_contracts(cls, db: Session) -> float:
        """Calculate balance index from current contracts"""
        
        # Get exposure per wilaya
        results = db.query(
            Contract.wilaya_id,
            func.sum(Contract.capital_assure).label("total_capital")
        ).filter(Contract.is_active == True).group_by(Contract.wilaya_id).all()
        
        exposures = [float(r.total_capital) for r in results]
        
        return cls.calculate(exposures)
    
    @classmethod
    def get_detailed_balance(cls, db: Session) -> Dict[str, Any]:
        """Get detailed balance analysis"""
        
        # Get exposure per wilaya with wilaya info
        results = db.query(
            Wilaya.id,
            Wilaya.name_fr,
            Wilaya.code,
            Wilaya.rpa_zone,
            func.coalesce(func.sum(Contract.capital_assure), 0).label("total_capital")
        ).outerjoin(Contract, (Contract.wilaya_id == Wilaya.id) & (Contract.is_active == True))\
         .group_by(Wilaya.id, Wilaya.name_fr, Wilaya.code, Wilaya.rpa_zone)\
         .order_by(func.coalesce(func.sum(Contract.capital_assure), 0).desc())\
         .all()
        
        exposures = [float(r.total_capital) for r in results]
        total_exposure = sum(exposures)
        balance_index = cls.calculate(exposures)
        
        # Calculate concentration metrics
        top_3_exposure = sum(sorted(exposures, reverse=True)[:3])
        top_5_exposure = sum(sorted(exposures, reverse=True)[:5])
        
        # Gini coefficient
        sorted_exposures = sorted(exposures)
        n = len(sorted_exposures)
        gini_numerator = sum((2 * i - n - 1) * x for i, x in enumerate(sorted_exposures, 1))
        gini = gini_numerator / (n * sum(sorted_exposures)) if sum(sorted_exposures) > 0 else 0
        
        return {
            "balance_index": round(balance_index, 1),
            "total_exposure_dzd": total_exposure,
            "number_of_wilayas_with_exposure": len([e for e in exposures if e > 0]),
            "total_wilayas": len(results),
            "concentration": {
                "top_3_exposure_dzd": top_3_exposure,
                "top_3_percentage": round(top_3_exposure / total_exposure * 100, 1) if total_exposure > 0 else 0,
                "top_5_exposure_dzd": top_5_exposure,
                "top_5_percentage": round(top_5_exposure / total_exposure * 100, 1) if total_exposure > 0 else 0,
                "gini_coefficient": round(gini, 3)
            },
            "wilaya_details": [
                {
                    "wilaya_id": r.id,
                    "wilaya_name": r.name_fr,
                    "code": r.code,
                    "rpa_zone": r.rpa_zone,
                    "exposure_dzd": float(r.total_capital),
                    "percentage": round(float(r.total_capital) / total_exposure * 100, 1) if total_exposure > 0 else 0
                }
                for r in results
            ]
        }