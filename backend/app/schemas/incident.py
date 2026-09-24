from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class IncidentActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    incident_id: str
    action_type: str
    description: str
    priority: int
    status: str
    approved_by: Optional[str] = None
    executed_at: Optional[datetime] = None
    result_summary: Optional[str] = None
    created_at: datetime


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    incident_number: str
    title: str
    severity: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    trigger: str
    status: str
    current_state: Dict[str, Any]
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    actions: List[IncidentActionResponse] = []


class IncidentActionApprovalRequest(BaseModel):
    approved_by: str = "Lead SRE"


class IncidentActionExecuteRequest(BaseModel):
    notes: Optional[str] = None
