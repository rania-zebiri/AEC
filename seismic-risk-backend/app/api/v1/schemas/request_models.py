from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from enum import Enum


# =========================================================
# ENUMS
# =========================================================

class DecisionEnum(str, Enum):
    ACCEPT = "ACCEPT"
    REJECT = "REJECT"
    ACCEPT_WITH_CONDITIONS = "ACCEPT_WITH_CONDITIONS"


class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ReportTypeEnum(str, Enum):
    RECOMMENDATION = "RECOMMENDATION"
    ACAPS = "ACAPS"
    WHATIF = "WHATIF"
    UNDERWRITING_NARRATIVE = "UNDERWRITING_NARRATIVE"


class JobTypeEnum(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    ALL = "all"


# =========================================================
# PML SIMULATION
# =========================================================

class PMLRequest(BaseModel):
    """Request model for PML simulation"""
    wilaya_id: int = Field(..., description="Wilaya ID to simulate", ge=1, le=58)
    magnitude: float = Field(..., description="Earthquake magnitude", ge=4.0, le=8.5)
    scenario_month: Optional[date] = Field(None, description="Month for historical simulation")
    generate_narrative: bool = Field(False, description="Generate AI narrative")
    
    @validator('magnitude')
    def validate_magnitude(cls, v):
        if v < 4.0 or v > 8.5:
            raise ValueError('Magnitude must be between 4.0 and 8.5')
        return v


class PortfolioPMLRequest(BaseModel):
    """Request model for portfolio PML simulation"""
    magnitude: float = Field(..., description="Earthquake magnitude", ge=4.0, le=8.5)
    include_details: bool = Field(True, description="Include per-wilaya details")


# =========================================================
# UNDERWRITING
# =========================================================

class UnderwritingRequest(BaseModel):
    """Request model for underwriting evaluation"""
    numero_police: str = Field(..., max_length=50, description="Policy number")
    wilaya_id: int = Field(..., description="Wilaya ID", ge=1, le=58)
    building_type_id: int = Field(..., description="Building type ID", ge=1, le=8)
    code_sous_branche: str = Field(..., max_length=20, description="Risk category code")
    capital_proposed_dzd: float = Field(..., gt=0, description="Proposed capital in DZD")
    date_effect: date = Field(..., description="Contract start date")
    date_expiration: date = Field(..., description="Contract end date")
    commune: str = Field(default="", max_length=100, description="Commune name")
    generate_explanation: bool = Field(False, description="Generate AI explanation")
    
    @validator('date_expiration')
    def validate_dates(cls, v, values):
        if 'date_effect' in values and v <= values['date_effect']:
            raise ValueError('date_expiration must be after date_effect')
        return v


# =========================================================
# CONTRACT FILTERING
# =========================================================

class ContractFilterRequest(BaseModel):
    """Request model for filtering contracts"""
    wilaya_ids: Optional[List[int]] = Field(None, description="Filter by wilaya IDs")
    zone_scores: Optional[List[float]] = Field(None, description="Filter by zone scores")
    building_type_ids: Optional[List[int]] = Field(None, description="Filter by building type IDs")
    code_sous_branche: Optional[str] = Field(None, max_length=20, description="Filter by branch code")
    min_capital: Optional[float] = Field(None, ge=0, description="Minimum capital")
    max_capital: Optional[float] = Field(None, ge=0, description="Maximum capital")
    min_risk_score: Optional[float] = Field(None, ge=0, le=100, description="Minimum risk score")
    max_risk_score: Optional[float] = Field(None, ge=0, le=100, description="Maximum risk score")
    risk_levels: Optional[List[str]] = Field(None, description="Filter by risk levels")
    is_active: Optional[bool] = Field(True, description="Filter by active status")
    limit: int = Field(100, ge=1, le=500, description="Results per page")
    offset: int = Field(0, ge=0, description="Pagination offset")


# =========================================================
# SIMULATION
# =========================================================

class SimulationRequest(BaseModel):
    """Request model for what-if simulations"""
    name: str = Field(..., max_length=100, description="Simulation name")
    description: Optional[str] = Field(None, description="Simulation description")
    parameters: Dict[str, Any] = Field(..., description="Simulation parameters")
    
    # Parameters can include:
    # - new_contracts: List of new contracts to add
    # - removed_contracts: List of contract IDs to remove
    # - changed_capital: Changes to existing capital
    # - new_retention_capacity: New retention threshold


class AlertSimulationRequest(BaseModel):
    """Request model for simulating seismic alerts"""
    magnitude: float = Field(..., ge=4.0, le=8.5, description="Earthquake magnitude")
    wilaya_id: int = Field(..., description="Wilaya ID", ge=1, le=58)
    event_datetime: Optional[datetime] = Field(None, description="Event datetime")
    depth_km: float = Field(10.0, ge=0, le=100, description="Depth in kilometers")
    latitude: Optional[float] = Field(None, ge=20, le=38, description="Epicenter latitude")
    longitude: Optional[float] = Field(None, ge=-9, le=12, description="Epicenter longitude")


# =========================================================
# REPORT
# =========================================================

class ReportRequest(BaseModel):
    """Request model for generating reports"""
    report_type: ReportTypeEnum = Field(..., description="Type of report")
    reference_month: Optional[date] = Field(None, description="Month for the report")
    regenerate: bool = Field(False, description="Force regeneration even if cached")
    format: str = Field("json", description="Output format: json, text, pdf")


# =========================================================
# AUTHENTICATION
# =========================================================

class LoginRequest(BaseModel):
    """Request model for user login"""
    username: str = Field(..., max_length=50, description="Username")
    password: str = Field(..., min_length=6, description="Password")


class RefreshTokenRequest(BaseModel):
    """Request model for refreshing JWT token"""
    refresh_token: str = Field(..., description="Refresh token")


class ChangePasswordRequest(BaseModel):
    """Request model for changing password"""
    old_password: str = Field(..., min_length=6, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")
    confirm_password: str = Field(..., min_length=6, description="Confirm new password")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('passwords do not match')
        return v


# =========================================================
# CONFIGURATION
# =========================================================

class RetentionConfigRequest(BaseModel):
    """Request model for updating retention configuration"""
    config_key: str = Field(..., max_length=60, description="Configuration key")
    config_value: float = Field(..., description="Configuration value")
    description: Optional[str] = Field(None, description="Configuration description")
    effective_from: date = Field(..., description="Effective date")


# =========================================================
# SCHEDULER
# =========================================================

class SchedulerJobRequest(BaseModel):
    """Request model for running scheduler jobs"""
    job_type: JobTypeEnum = Field(..., description="Type of job to run")
    target_month: Optional[date] = Field(None, description="Target month for monthly jobs")