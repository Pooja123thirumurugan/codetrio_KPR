from typing import Dict, Any, List
from pydantic import BaseModel


class OverviewMetrics(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    critical_tickets: int
    at_risk_tickets: int
    predicted_breaches: int
    actual_breaches: int
    average_resolution_minutes: float
    average_sla_compliance_rate: float
    total_agents: int
    available_agents: int
    average_agent_utilization: float


class SLAMetrics(BaseModel):
    compliance_rate: float
    total_evaluated: int
    safe_count: int
    warning_count: int
    at_risk_count: int
    breached_count: int
    predicted_pre_breach_count: int
    breach_rate_by_priority: Dict[str, float]
    breach_rate_by_department: Dict[str, float]


class RoutingMetrics(BaseModel):
    total_routed: int
    auto_routed_percent: float
    average_routing_score: float
    fallback_routing_count: int
    no_available_agent_count: int
    department_load_distribution: Dict[str, int]


class AgentMetrics(BaseModel):
    total_agents: int
    available_count: int
    busy_count: int
    at_capacity_count: int
    offline_count: int
    average_utilization: float
    top_performers: List[Dict[str, Any]]
    overloaded_agents: List[Dict[str, Any]]


class EscalationMetrics(BaseModel):
    total_escalations: int
    pending_approval: int
    approved: int
    executed: int
    rejected: int
    prevented_breaches_count: int
    escalation_by_trigger: Dict[str, int]
    escalation_by_level: Dict[str, int]
