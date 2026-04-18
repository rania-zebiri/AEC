# app/api/v1/endpoints/settings.py (version sans authentification)
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.retention_config import RetentionConfig
from app.models.wilaya import Wilaya
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/settings", tags=["Settings"])


# ==================== RETENTION PARAMETERS ====================
@router.get("/retention")
def get_retention_config(db: Session = Depends(get_db)):
    """Récupère la configuration de rétention"""
    
    config = db.query(RetentionConfig).order_by(
        RetentionConfig.effective_from.desc()
    ).first()
    
    return {
        "global_capacity_dzd": float(config.config_value) if config else 1000000000,
        "effective_from": config.effective_from.isoformat() if config else None,
        "updated_at": config.updated_at.isoformat() if config else None
    }


@router.put("/retention")
def update_retention_config(
    global_capacity_dzd: float,
    db: Session = Depends(get_db)
):
    """Met à jour la configuration de rétention"""
    
    # Désactiver l'ancienne config
    db.query(RetentionConfig).update({"effective_to": datetime.now().date()})
    
    # Créer nouvelle config
    new_config = RetentionConfig(
        config_key="GLOBAL_RETENTION_CAPACITY",
        config_value=global_capacity_dzd,
        description="Global retention capacity",
        unit="DZD",
        effective_from=datetime.now().date(),
        updated_at=datetime.now()
    )
    db.add(new_config)
    db.commit()
    
    return {"message": "Retention configuration updated", "new_capacity": global_capacity_dzd}


# ==================== ZONE CLASSIFICATION ====================
@router.get("/zones")
def get_zone_classification(db: Session = Depends(get_db)):
    """Récupère la classification des zones par wilaya"""
    
    wilayas = db.query(Wilaya).order_by(Wilaya.id).all()
    
    return [
        {
            "id": w.id,
            "code": w.code,
            "name_fr": w.name_fr,
            "default_zone": w.rpa_zone,
            "override_zone": w.rpa_zone,
            "zone_score": float(w.zone_score)
        }
        for w in wilayas
    ]


@router.put("/zones/{wilaya_id}")
def update_zone_override(
    wilaya_id: int,
    override_zone: str,
    db: Session = Depends(get_db)
):
    """Met à jour l'override de zone pour une wilaya"""
    
    wilaya = db.query(Wilaya).filter(Wilaya.id == wilaya_id).first()
    if not wilaya:
        raise HTTPException(status_code=404, detail="Wilaya not found")
    
    # Mettre à jour la zone
    wilaya.rpa_zone = override_zone
    
    # Mettre à jour le score de zone
    zone_scores = {"III": 3.0, "IIb": 2.0, "IIa": 1.5, "I": 1.0, "0": 0.5}
    wilaya.zone_score = zone_scores.get(override_zone, 1.0)
    
    db.commit()
    
    return {"message": f"Zone updated for {wilaya.name_fr}", "new_zone": override_zone}


# ==================== USERS ====================
@router.get("/users")
def get_users(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Récupère la liste des utilisateurs"""
    
    users = db.query(User).order_by(User.created_at.desc()).offset(offset).limit(limit).all()
    total = db.query(User).count()
    
    return {
        "users": [
            {
                "id": u.id,
                "name": u.full_name,
                "email": u.email,
                "username": u.username,
                "role": u.role,
                "is_active": u.is_active,
                "last_login": u.last_login_at.isoformat() if u.last_login_at else None,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db)
):
    """Met à jour le rôle d'un utilisateur"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.role = role
    db.commit()
    
    return {"message": f"Role updated for {user.full_name}", "new_role": role}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Supprime un utilisateur"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    return {"message": f"User deleted"}


# ==================== AUDIT LOG ====================
@router.get("/audit")
def get_audit_log(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Récupère le journal d'audit"""
    
    logs = db.query(AuditLog).order_by(
        desc(AuditLog.created_at)
    ).offset(offset).limit(limit).all()
    
    total = db.query(AuditLog).count()
    
    return {
        "logs": [
            {
                "id": l.id,
                "time": l.created_at.isoformat() if l.created_at else None,
                "user": l.user.full_name if l.user else "System",
                "action": l.action,
                "target": l.entity_type,
                "details": l.detail_json
            }
            for l in logs
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }