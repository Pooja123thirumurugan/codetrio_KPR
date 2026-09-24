from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class SimulationRequest(BaseModel):
    scenario: str = "TICKET_SPIKE"  # NORMAL_LOAD, TICKET_SPIKE, AGENT_FAILURE, QUEUE_OVERLOAD, SLA_TIGHTENING, CRITICAL_SURGE, RECOVERY, CUSTOM
    additional_tickets: int = 50
    agent_reduction: int = 0
    sla_change_percent: float = 0.0
    department_id: Optional[str] = None


class SimulationResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    simulation_id: str
    initial_state: Dict[str, Any]
    simulated_state: Dict[str, Any]
    queue_change: Dict[str, Any]
    capacity_change: Dict[str, Any]
    risk_change: Dict[str, Any]
    predicted_breaches: int
    at_risk_tickets_count: int
    recommended_actions: List[str]
    metrics: Optional[Dict[str, Any]] = None
    created_at: datetime


class SimulationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scenario: str
    parameters: Dict[str, Any]
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[SimulationResultResponse] = None
