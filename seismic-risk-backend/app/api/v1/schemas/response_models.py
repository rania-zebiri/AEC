from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


# =========================================================
# BASE RESPONSES
# =========================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(..., description="Current timestamp")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    status_code: int = Field(..., description="HTTP status code")
    timestamp: datetime = Field(..., description="Error timestamp")


class PaginationResponse(BaseModel):
    """Pagination metadata"""
    total: int = Field(..., description="Total number of items")
    limit: int = Field(..., description="Items per page")
    offset: int = Field(..., description="Current offset")
    has_more: bool = Field(..., description="Whether more items exist")


# =========================================================
# DASHBOARD
# =========================================================

class CategoryStats(BaseModel):
    """Statistics per category"""
    total_capital_dzd: float = Field(..., description="Total capital in DZD")
    contract_count: int = Field(..., description="Number of contracts")
    total_premium_dzd: float = Field(..., description="Total premium in DZD")


class WilayaDashboardData(BaseModel):
    """Dashboard data per wilaya"""
    wilaya: str = Field(..., description="Wilaya name")
    wilaya_id: int = Field(..., description="Wilaya ID")
    rpa_zone: str = Field(..., description="RPA zone")
    zone_score: float = Field(..., description="Zone score")
    categories: Dict[str, CategoryStats] = Field(..., description="Data by category")


class DashboardTotals(BaseModel):
    """Dashboard totals"""
    total_capital_dzd: float = Field(..., description="Total capital in DZD")
    total_premium_dzd: float = Field(..., description="Total premium in DZD")
    total_contracts: int = Field(..., description="Total number of contracts")


class DashboardSummaryResponse(BaseModel):
    """Dashboard summary response"""
    grouped_data: List[WilayaDashboardData] = Field(..., description="Data grouped by wilaya")
    totals: DashboardTotals = Field(..., description="Global totals")


class KPICardsResponse(BaseModel):
    """KPI cards response"""
    total_exposure_dzd: float = Field(..., description="Total exposure in DZD")
    total_premium_dzd: float = Field(..., description="Total premium in DZD")
    active_contracts: int = Field(..., description="Number of active contracts")
    avg_risk_score: float = Field(..., description="Average risk score")
    hotspot_count: int = Field(..., description="Number of hotspots")
    pml_mag65_dzd: float = Field(..., description="PML for magnitude 6.5")


class ExposureTimelineResponse(BaseModel):
    """Exposure timeline response"""
    labels: List[str] = Field(..., description="Month labels")
    exposure: List[float] = Field(..., description="Exposure values")
    premium: List[float] = Field(..., description="Premium values")
    pml: List[float] = Field(..., description="PML values")
    balance_index: List[float] = Field(..., description="Balance index values")


# =========================================================
# MAP
# =========================================================

class WilayaMapData(BaseModel):
    """Map data per wilaya"""
    id: int = Field(..., description="Wilaya ID")
    code: str = Field(..., description="Wilaya code")
    name_fr: str = Field(..., description="French name")
    name_ar: str = Field(..., description="Arabic name")
    rpa_zone: str = Field(..., description="RPA zone")
    zone_score: float = Field(..., description="Zone score")
    color: str = Field(..., description="Map color")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    region: Optional[str] = Field(None, description="Region")
    total_capital_dzd: float = Field(..., description="Total capital in DZD")
    contract_count: int = Field(..., description="Number of contracts")
    is_hotspot: bool = Field(False, description="Whether hotspot")
    excess_dzd: float = Field(0, description="Excess over retention")


class MapDataResponse(BaseModel):
    """Map data response"""
    wilayas: List[WilayaMapData] = Field(..., description="List of wilayas")


class ContractListItem(BaseModel):
    """Contract item for list views"""
    id: int = Field(..., description="Contract ID")
    numero_police: str = Field(..., description="Policy number")
    code_sous_branche: str = Field(..., description="Branch code")
    capital_assure_dzd: float = Field(..., description="Insured capital")
    prime_nette_dzd: float = Field(..., description="Net premium")
    date_effect: str = Field(..., description="Start date")
    date_expiration: str = Field(..., description="End date")
    commune: str = Field(..., description="Commune")
    risk_score: Optional[float] = Field(None, description="Risk score")
    risk_level: Optional[str] = Field(None, description="Risk level")


class WilayaContractsResponse(BaseModel):
    """Contracts by wilaya response"""
    wilaya: Dict[str, Any] = Field(..., description="Wilaya information")
    contracts: List[ContractListItem] = Field(..., description="List of contracts")
    pagination: PaginationResponse = Field(..., description="Pagination info")


class HotspotResponse(BaseModel):
    """Hotspot response"""
    wilaya_id: int = Field(..., description="Wilaya ID")
    wilaya_name: str = Field(..., description="Wilaya name")
    rpa_zone: str = Field(..., description="RPA zone")
    total_capital_dzd: float = Field(..., description="Total capital")
    retention_capacity_dzd: float = Field(..., description="Retention capacity")
    excess_dzd: float = Field(..., description="Excess amount")
    excess_pct: float = Field(..., description="Excess percentage")
    contract_count: int = Field(..., description="Number of contracts")
    pml_mag65_dzd: float = Field(..., description="PML for M6.5")


# =========================================================
# TOP 10
# =========================================================

class RiskyPolicyItem(BaseModel):
    """Risky policy item"""
    rank: int = Field(..., description="Rank")
    id: int = Field(..., description="Contract ID")
    numero_police: str = Field(..., description="Policy number")
    code_sous_branche: str = Field(..., description="Branch code")
    capital_assure_dzd: float = Field(..., description="Insured capital")
    prime_nette_dzd: float = Field(..., description="Net premium")
    wilaya: str = Field(..., description="Wilaya name")
    rpa_zone: str = Field(..., description="RPA zone")
    zone_score: float = Field(..., description="Zone score")
    building_type: str = Field(..., description="Building type")
    vulnerability_factor: float = Field(..., description="Vulnerability factor")
    risk_score: Optional[float] = Field(None, description="Risk score")
    risk_level: Optional[str] = Field(None, description="Risk level")
    risk_weight: float = Field(..., description="Risk weight")


class Top10Response(BaseModel):
    """Top 10 risky policies response"""
    policies: List[RiskyPolicyItem] = Field(..., description="List of risky policies")


# =========================================================
# PML
# =========================================================

class PMLResponse(BaseModel):
    """PML simulation response"""
    simulation_id: int = Field(..., description="Simulation ID")
    wilaya_id: int = Field(..., description="Wilaya ID")
    wilaya_name: str = Field(..., description="Wilaya name")
    magnitude: float = Field(..., description="Earthquake magnitude")
    total_capital_dzd: float = Field(..., description="Total capital in wilaya")
    contract_count: int = Field(..., description="Number of contracts")
    expected_loss_dzd: float = Field(..., description="Expected loss")
    reinsurance_cover_dzd: float = Field(..., description="Reinsurance coverage")
    net_company_loss_dzd: float = Field(..., description="Net company loss")
    loss_ratio_pct: float = Field(..., description="Loss ratio percentage")
    intensity_factor_used: float = Field(..., description="Intensity factor")
    ai_narrative: Optional[str] = Field(None, description="AI generated narrative")


class PortfolioPMLResponse(BaseModel):
    """Portfolio PML response"""
    magnitude: float = Field(..., description="Earthquake magnitude")
    total_portfolio_loss_dzd: float = Field(..., description="Total portfolio loss")
    total_portfolio_capital_dzd: float = Field(..., description="Total portfolio capital")
    portfolio_loss_ratio_pct: float = Field(..., description="Portfolio loss ratio")
    wilaya_results: List[Dict[str, Any]] = Field(..., description="Results per wilaya")


class PMLHistoryItem(BaseModel):
    """PML history item"""
    id: int = Field(..., description="Simulation ID")
    wilaya_id: int = Field(..., description="Wilaya ID")
    magnitude: float = Field(..., description="Magnitude")
    scenario_month: Optional[str] = Field(None, description="Scenario month")
    expected_loss_dzd: float = Field(..., description="Expected loss")
    net_company_loss_dzd: float = Field(..., description="Net loss")
    loss_ratio_pct: float = Field(..., description="Loss ratio")
    simulated_at: Optional[str] = Field(None, description="Simulation timestamp")
    has_narrative: bool = Field(False, description="Has AI narrative")


class PMLHistoryResponse(BaseModel):
    """PML history response"""
    simulations: List[PMLHistoryItem] = Field(..., description="List of simulations")
    pagination: PaginationResponse = Field(..., description="Pagination info")


# =========================================================
# UNDERWRITING
# =========================================================

class UnderwritingResponse(BaseModel):
    """Underwriting evaluation response"""
    decision_id: int = Field(..., description="Decision ID")
    decision: str = Field(..., description="Decision: ACCEPT/REJECT/ACCEPT_WITH_CONDITIONS")
    reason_fr: str = Field(..., description="Reason in French")
    risk_score: Optional[float] = Field(None, description="Risk score")
    risk_level: Optional[str] = Field(None, description="Risk level")
    remaining_capacity_dzd: Optional[float] = Field(None, description="Remaining capacity")
    conditions: Optional[List[str]] = Field(None, description="Conditions if applicable")
    ai_explanation: Optional[str] = Field(None, description="AI generated explanation")


class UnderwritingDecisionItem(BaseModel):
    """Underwriting decision item"""
    id: int = Field(..., description="Decision ID")
    numero_police_input: str = Field(..., description="Policy number")
    decision: str = Field(..., description="Decision")
    reason_fr: str = Field(..., description="Reason")
    risk_score_at_decision: Optional[float] = Field(None, description="Risk score")
    capital_proposed_dzd: float = Field(..., description="Proposed capital")
    remaining_capacity_dzd: Optional[float] = Field(None, description="Remaining capacity")
    conditions: Optional[List[str]] = Field(None, description="Conditions")
    decided_at: Optional[str] = Field(None, description="Decision timestamp")
    contract_accepted: bool = Field(False, description="Contract was accepted")


class UnderwritingHistoryResponse(BaseModel):
    """Underwriting history response"""
    decisions: List[UnderwritingDecisionItem] = Field(..., description="List of decisions")
    pagination: PaginationResponse = Field(..., description="Pagination info")


# =========================================================
# MONTHLY COMPARE
# =========================================================

class MonthlyStatsData(BaseModel):
    """Monthly statistics data"""
    month_date: str = Field(..., description="Month")
    total_exposure_dzd: float = Field(..., description="Total exposure")
    total_premium_dzd: float = Field(..., description="Total premium")
    active_contract_count: int = Field(..., description="Active contracts")
    hotspot_count: int = Field(..., description="Hotspot count")
    zone3_exposure_dzd: float = Field(..., description="Zone III exposure")
    zone3_exposure_pct: float = Field(..., description="Zone III exposure percentage")
    pml_mag65_dzd: float = Field(..., description="PML for M6.5")
    pml_mag65_pct_of_exposure: float = Field(..., description="PML percentage")
    balance_index: float = Field(..., description="Balance index")
    new_contracts_count: int = Field(..., description="New contracts")
    cancelled_contracts_count: int = Field(..., description="Cancelled contracts")
    avg_risk_score: float = Field(..., description="Average risk score")
    max_risk_score: float = Field(..., description="Maximum risk score")


class MonthlyCompareResponse(BaseModel):
    """Monthly comparison response"""
    current_month: Optional[MonthlyStatsData] = Field(None, description="Current month data")
    previous_month: Optional[MonthlyStatsData] = Field(None, description="Previous month data")
    changes: Optional[Dict[str, Any]] = Field(None, description="Changes between months")


class MonthlyChartDataResponse(BaseModel):
    """Monthly chart data response"""
    labels: List[str] = Field(..., description="Month labels")
    exposure: List[float] = Field(..., description="Exposure values")
    premium: List[float] = Field(..., description="Premium values")
    pml: List[float] = Field(..., description="PML values")
    balance_index: List[float] = Field(..., description="Balance index values")
    hotspot_count: List[int] = Field(..., description="Hotspot counts")
    active_contracts: List[int] = Field(..., description="Active contract counts")


# =========================================================
# OPPORTUNITIES
# =========================================================

class OpportunityResponse(BaseModel):
    """Opportunity response"""
    id: int = Field(..., description="Wilaya ID")
    code: str = Field(..., description="Wilaya code")
    name_fr: str = Field(..., description="French name")
    name_ar: str = Field(..., description="Arabic name")
    rpa_zone: str = Field(..., description="RPA zone")
    zone_score: float = Field(..., description="Zone score")
    latitude: Optional[float] = Field(None, description="Latitude")
    longitude: Optional[float] = Field(None, description="Longitude")
    region: Optional[str] = Field(None, description="Region")
    population_growth_pct: float = Field(..., description="Population growth")
    competition_level: str = Field(..., description="Competition level")
    current_exposure_dzd: float = Field(..., description="Current exposure")
    contract_count: int = Field(..., description="Number of contracts")
    opportunity_score: float = Field(..., description="Opportunity score (0-100)")
    opportunity_level: str = Field(..., description="HIGH/MEDIUM/LOW")
    color: str = Field(..., description="Display color")
    available_capacity_dzd: float = Field(..., description="Available capacity")


# =========================================================
# CLIENT SCORE
# =========================================================

class RiskScoreComponents(BaseModel):
    """Risk score components"""
    zone_score_component: Optional[float] = Field(None, description="Zone contribution")
    vuln_component: Optional[float] = Field(None, description="Vulnerability contribution")
    capital_component: Optional[float] = Field(None, description="Capital contribution")


class ClientScoreResponse(BaseModel):
    """Client risk score response"""
    contract_id: int = Field(..., description="Contract ID")
    numero_police: str = Field(..., description="Policy number")
    wilaya: Dict[str, Any] = Field(..., description="Wilaya information")
    code_sous_branche: str = Field(..., description="Branch code")
    capital_assure_dzd: float = Field(..., description="Insured capital")
    prime_nette_dzd: float = Field(..., description="Net premium")
    date_effect: str = Field(..., description="Start date")
    date_expiration: str = Field(..., description="End date")
    commune: str = Field(..., description="Commune")
    risk_score: float = Field(..., description="Risk score (0-100)")
    risk_level: str = Field(..., description="Risk level")
    risk_text: str = Field(..., description="Risk level text in French")
    color: str = Field(..., description="Display color")
    bg_color: str = Field(..., description="Background color")
    components: RiskScoreComponents = Field(..., description="Score components")
    percentile: float = Field(..., description="Percentile rank")
    is_top_10_percent: bool = Field(False, description="In top 10%")


class RiskDistributionItem(BaseModel):
    """Risk distribution item"""
    level: str = Field(..., description="Risk level")
    count: int = Field(..., description="Number of contracts")
    percentage: float = Field(..., description="Percentage of total")
    total_capital_dzd: float = Field(..., description="Total capital")
    capital_percentage: float = Field(..., description="Capital percentage")


class RiskDistributionResponse(BaseModel):
    """Risk distribution response"""
    distribution: List[RiskDistributionItem] = Field(..., description="Distribution by level")
    summary: Dict[str, Any] = Field(..., description="Summary statistics")


# =========================================================
# SEGMENTATION
# =========================================================

class SegmentationStatisticsResponse(BaseModel):
    """Segmentation statistics response"""
    by_rpa_zone: List[Dict[str, Any]] = Field(..., description="Statistics by RPA zone")
    by_building_type: List[Dict[str, Any]] = Field(..., description="Statistics by building type")
    by_branch: List[Dict[str, Any]] = Field(..., description="Statistics by branch")


# =========================================================
# REPORTS
# =========================================================

class ReportResponse(BaseModel):
    """Report response"""
    report: str = Field(..., description="Report content")
    cached: bool = Field(False, description="From cache")
    generated_at: str = Field(..., description="Generation timestamp")
    month: Optional[str] = Field(None, description="Reference month")
    format: str = Field("text", description="Report format")


class ReportHistoryItem(BaseModel):
    """Report history item"""
    id: int = Field(..., description="Report ID")
    report_type: str = Field(..., description="Report type")
    reference_month: Optional[str] = Field(None, description="Reference month")
    generated_at: str = Field(..., description="Generation timestamp")
    is_valid: bool = Field(..., description="Whether valid")


class ReportHistoryResponse(BaseModel):
    """Report history response"""
    reports: List[ReportHistoryItem] = Field(..., description="List of reports")


# =========================================================
# ALERTS
# =========================================================

class AlertPMLInfo(BaseModel):
    """Alert PML information"""
    expected_loss_dzd: float = Field(..., description="Expected loss")
    net_company_loss_dzd: float = Field(..., description="Net company loss")
    loss_ratio_pct: float = Field(..., description="Loss ratio")


class AlertResponse(BaseModel):
    """Alert response"""
    id: int = Field(..., description="Alert ID")
    event_id_external: str = Field(..., description="External event ID")
    event_datetime: str = Field(..., description="Event datetime")
    magnitude: float = Field(..., description="Earthquake magnitude")
    wilaya: Optional[str] = Field(None, description="Wilaya name")
    epicenter_lat: Optional[float] = Field(None, description="Epicenter latitude")
    epicenter_lng: Optional[float] = Field(None, description="Epicenter longitude")
    depth_km: Optional[float] = Field(None, description="Depth in km")
    alert_sent: bool = Field(False, description="Alert sent")
    has_pml: bool = Field(False, description="Has PML simulation")
    pml_simulation: Optional[AlertPMLInfo] = Field(None, description="PML information")


class SimulatedAlertResponse(BaseModel):
    """Simulated alert response"""
    alert_id: int = Field(..., description="Alert ID")
    message: str = Field(..., description="Status message")
    pml: Dict[str, float] = Field(..., description="PML results")


# =========================================================
# AUTHENTICATION
# =========================================================

class LoginResponse(BaseModel):
    """Login response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")
    user: Dict[str, Any] = Field(..., description="User information")


class UserInfoResponse(BaseModel):
    """User information response"""
    id: int = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="Email")
    full_name: str = Field(..., description="Full name")
    role: str = Field(..., description="User role")
    receive_alerts: bool = Field(..., description="Receive alerts")


# =========================================================
# CONFIGURATION
# =========================================================

class RetentionConfigResponse(BaseModel):
    """Retention configuration response"""
    value: float = Field(..., description="Configuration value")
    unit: str = Field(..., description="Unit")
    description: str = Field(..., description="Description")
    effective_from: str = Field(..., description="Effective date")