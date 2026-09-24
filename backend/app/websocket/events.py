from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel


class WSEventType:
    TICKET_CREATED = "TICKET_CREATED"
    TICKET_UPDATED = "TICKET_UPDATED"
    SLA_RISK_UPDATED = "SLA_RISK_UPDATED"
    ROUTING_UPDATED = "ROUTING_UPDATED"
    ESCALATION_TRIGGERED = "ESCALATION_TRIGGERED"
    AGENT_CAPACITY_UPDATED = "AGENT_CAPACITY_UPDATED"
    INCIDENT_CREATED = "INCIDENT_CREATED"
    SIMULATION_COMPLETED = "SIMULATION_COMPLETED"


class WSEvent(BaseModel):
    event_type: str
    payload: Dict[str, Any]
    timestamp: str = None

    def __init__(self, **data):
        super().__init__(**data)
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()
