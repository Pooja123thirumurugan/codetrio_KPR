from typing import Dict, Any, List
from pydantic import BaseModel


class SimulatedAgent(BaseModel):
    agent_id: str
    name: str
    max_capacity: int
    active_ticket_count: int
    utilization: float
    is_offline: bool = False


class SimulationSnapshot(BaseModel):
    total_open_tickets: int
    critical_tickets: int
    active_agents: int
    total_capacity: int
    average_utilization: float
    average_breach_probability: float
    at_risk_count: int
    predicted_breaches: int
    agents: List[SimulatedAgent] = []
