from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class TicketBase(BaseModel):
    subject: str
    description: str
    channel: str = "WEB"  # WEB, EMAIL, CHAT, API, PHONE
    customer_id: str
    priority: Optional[str] = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    urgency: Optional[str] = "MEDIUM"   # LOW, MEDIUM, HIGH, CRITICAL
    category: Optional[str] = None
    department_id: Optional[str] = None
    tags: Optional[List[str]] = []
    metadata_json: Optional[Dict[str, Any]] = None


class TicketCreate(BaseModel):
    subject: str
    description: str
    channel: str = "WEB"
    customer_id: Optional[str] = None
    customer_email: Optional[str] = None  # Auto-resolve or create customer if provided
    customer_name: Optional[str] = None
    priority: Optional[str] = None
    urgency: Optional[str] = None
    category: Optional[str] = None
    department_id: Optional[str] = None
    tags: Optional[List[str]] = []


class TicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    urgency: Optional[str] = None
    category: Optional[str] = None
    department_id: Optional[str] = None
    assigned_agent_id: Optional[str] = None
    resolved_at: Optional[datetime] = None
    tags: Optional[List[str]] = None


class TicketClassificationResponse(BaseModel):
    category: str
    department: str
    department_id: Optional[str] = None
    confidence: float
    is_fallback: bool
    explanation: Optional[str] = None


class TicketUrgencyResponse(BaseModel):
    urgency: str  # LOW, MEDIUM, HIGH, CRITICAL
    urgency_score: float  # 0.0 - 1.0
    confidence: float
    is_fallback: bool
    explanation: str
    detected_signals: List[str]


class TicketResponse(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ticket_number: str
    status: str
    department_name: Optional[str] = None
    assigned_agent_id: Optional[str] = None
    assigned_agent_name: Optional[str] = None
    sla_policy_id: Optional[str] = None
    sla_deadline: Optional[datetime] = None
    first_response_deadline: Optional[datetime] = None
    first_responded_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Computed fields for frontend convenience
    sla_status: Optional[str] = None
    remaining_sla_minutes: Optional[float] = None
    breach_probability: Optional[float] = None
    risk_level: Optional[str] = None
