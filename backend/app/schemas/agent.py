from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr


class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None


class SkillResponse(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: str


class AgentBase(BaseModel):
    name: str
    email: EmailStr
    department_id: Optional[str] = None
    status: str = "AVAILABLE"  # AVAILABLE, BUSY, AT_CAPACITY, OFFLINE
    max_capacity: int = 5
    active_ticket_count: int = 0
    utilization: float = 0.0
    average_resolution_minutes: float = 45.0
    sla_breach_rate: float = 0.05
    availability: bool = True


class AgentCreate(AgentBase):
    skill_names: Optional[List[str]] = []


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[str] = None
    status: Optional[str] = None
    max_capacity: Optional[int] = None
    active_ticket_count: Optional[int] = None
    utilization: Optional[float] = None
    average_resolution_minutes: Optional[float] = None
    sla_breach_rate: Optional[float] = None
    availability: Optional[bool] = None
    skill_names: Optional[List[str]] = None


class AgentResponse(AgentBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    department_name: Optional[str] = None
    skills: List[SkillResponse] = []
    created_at: datetime
    updated_at: datetime


class AgentCapacityResponse(BaseModel):
    agent_id: str
    name: str
    status: str
    max_capacity: int
    active_ticket_count: int
    available_capacity: int
    utilization: float
    is_at_capacity: bool
    is_available: bool
