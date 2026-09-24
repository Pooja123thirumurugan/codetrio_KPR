from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class EscalationBase(BaseModel):
    ticket_id: str
    level: str = "LEVEL_1"  # LEVEL_1, LEVEL_2, MANAGER, INCIDENT
    trigger_type: str = "PRE_BREACH"  # PRE_BREACH, RISK_THRESHOLD, SLA_BUFFER, RISK_VELOCITY, CAPACITY_COLLAPSE, NO_ELIGIBLE_AGENT, MANUAL
    machine_reason: str
    human_reason: str
    risk_probability_at_trigger: float
    remaining_sla_minutes_at_trigger: float
    suggested_actions: Optional[List[str]] = []


class EscalationCreate(EscalationBase):
    pass


class EscalationApprovalRequest(BaseModel):
    approved_by: str = "Manager"
    notes: Optional[str] = None


class EscalationExecutionRequest(BaseModel):
    action_taken: str
    target_agent_id: Optional[str] = None
    notes: Optional[str] = None


class EscalationResponse(EscalationBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str  # PENDING_APPROVAL, APPROVED, REJECTED, EXECUTED, CANCELLED
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    execution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    ticket_number: Optional[str] = None
    ticket_subject: Optional[str] = None
