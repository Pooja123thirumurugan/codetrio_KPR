import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class AIResponse(Base):
    __tablename__ = "ai_responses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False, index=True)

    suggested_response = Column(Text, nullable=False)
    tone = Column(String(30), default="PROFESSIONAL", nullable=False)  # PROFESSIONAL, EMPATHETIC, URGENT, TECHNICAL, COURTEOUS
    category = Column(String(100), nullable=True)
    confidence = Column(Float, default=0.90, nullable=False)
    provider = Column(String(50), default="gemini", nullable=False)  # gemini, template_fallback

    prompt_tokens = Column(Integer, nullable=True)
    completion_tokens = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)

    status = Column(String(30), default="DRAFTED", nullable=False)  # DRAFTED, APPROVED, SENT, REJECTED
    approved_by = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    ticket = relationship("Ticket", back_populates="ai_responses")

    def __repr__(self) -> str:
        return f"<AIResponse {self.id} for Ticket {self.ticket_id} ({self.provider})>"
