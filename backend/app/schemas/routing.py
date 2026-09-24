from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class RecommendedAgentSummary(BaseModel):
    id: str
    name: str
    department_name: Optional[str] = None
    utilization: float
    active_ticket_count: int
    max_capacity: int
    sla_breach_rate: float


class AlternativeAgentSummary(BaseModel):
    agent_id: str
    name: str
    score: float
    skill_match_score: float = 0.0
    capacity_score: float = 0.0
    sla_suitability_score: float = 0.0
    queue_load_score: float = 0.0
    historical_performance_score: float = 0.0
    reasons: List[str] = []


class RoutingDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    ticket_id: str
    recommended_agent: Optional[RecommendedAgentSummary] = None
    status: str  # RECOMMENDED, ACCEPTED, REJECTED, NO_AVAILABLE_AGENT
    overall_score: float
    confidence: float
    skill_match_score: float
    capacity_score: float
    sla_suitability_score: float
    queue_load_score: float
    historical_performance_score: float
    reasons: List[str]
    alternatives: List[AlternativeAgentSummary] = []
    created_at: Optional[datetime] = None


class RouteTicketRequest(BaseModel):
    force_agent_id: Optional[str] = None
    allow_overcapacity: Optional[bool] = False
