from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    tier: str = "STANDARD"  # STANDARD, PREMIUM, ENTERPRISE, VIP
    company: Optional[str] = None
    sla_multiplier: float = 1.0


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    tier: Optional[str] = None
    company: Optional[str] = None
    sla_multiplier: Optional[float] = None


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
