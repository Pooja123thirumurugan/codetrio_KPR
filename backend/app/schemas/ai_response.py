from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AIResponseRequest(BaseModel):
    tone: Optional[str] = "PROFESSIONAL"  # PROFESSIONAL, EMPATHETIC, URGENT, TECHNICAL, COURTEOUS
    custom_instructions: Optional[str] = None


class AIResponseResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[str] = None
    ticket_id: str
    suggested_response: str
    tone: str
    category: Optional[str] = None
    confidence: float
    provider: str  # gemini, template_fallback
    status: str
    latency_ms: Optional[float] = None
    created_at: Optional[datetime] = None
