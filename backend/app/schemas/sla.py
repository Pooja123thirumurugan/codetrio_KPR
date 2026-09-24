from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class SLAPolicyBase(BaseModel):
    name: str
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    customer_tier: str = "STANDARD"  # STANDARD, PREMIUM, ENTERPRISE, VIP
    first_response_minutes: int = 60
    resolution_minutes: int = 240
    warning_threshold_percent: float = 75.0
    escalation_threshold_percent: float = 90.0
    is_active: bool = True
    auto_escalate: bool = True


class SLAPolicyCreate(SLAPolicyBase):
    pass


class SLAPolicyUpdate(BaseModel):
    name: Optional[str] = None
    priority: Optional[str] = None
    customer_tier: Optional[str] = None
    first_response_minutes: Optional[int] = None
    resolution_minutes: Optional[int] = None
    warning_threshold_percent: Optional[float] = None
    escalation_threshold_percent: Optional[float] = None
    is_active: Optional[bool] = None
    auto_escalate: Optional[bool] = None


class SLAPolicyResponse(SLAPolicyBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class SLACalculationResult(BaseModel):
    ticket_id: str
    ticket_number: str
    sla_policy_id: Optional[str] = None
    sla_policy_name: str
    priority: str
    created_at: datetime
    deadline: datetime
    elapsed_minutes: float
    remaining_minutes: float
    consumed_percent: float
    status: str  # SAFE, WARNING, AT_RISK, BREACHED
    is_breached: bool
    is_at_risk: bool
    warning_threshold_percent: float
    escalation_threshold_percent: float


class SLAPredictionRequest(BaseModel):
    ticket_id: str
    current_queue_depth: Optional[int] = None
    department_queue_depth: Optional[int] = None
    agent_utilization: Optional[float] = None


class SLAPredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    ticket_id: str
    ticket_number: str
    breach_probability: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    predicted_breach_time_minutes: Optional[float] = None
    confidence: float
    queue_depth_at_prediction: int
    agent_utilization_at_prediction: float
    sla_consumed_percent: float
    remaining_sla_minutes: float
    risk_velocity: Optional[float] = 0.0
    contributing_factors: List[str]
    model_version: str
    is_fallback: bool
    created_at: Optional[datetime] = None
