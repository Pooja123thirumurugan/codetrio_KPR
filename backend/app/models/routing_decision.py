import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class RoutingDecision(Base):
    __tablename__ = "routing_decisions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False, index=True)
    recommended_agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True, index=True)

    overall_score = Column(Float, nullable=False)
    confidence = Column(Float, default=0.85, nullable=False)

    # Component scores (Configurable weights: 30%, 25%, 20%, 15%, 10%)
    skill_match_score = Column(Float, default=0.0, nullable=False)
    capacity_score = Column(Float, default=0.0, nullable=False)
    sla_suitability_score = Column(Float, default=0.0, nullable=False)
    queue_load_score = Column(Float, default=0.0, nullable=False)
    historical_performance_score = Column(Float, default=0.0, nullable=False)

    reasons = Column(JSON, nullable=False)         # List of strings explaining why this agent was chosen
    alternatives = Column(JSON, nullable=True)     # List of alternative candidate agent summaries
    status = Column(String(30), default="RECOMMENDED", nullable=False)  # RECOMMENDED, ACCEPTED, REJECTED, OVERRIDDEN, NO_AVAILABLE_AGENT
    overridden_by_agent_id = Column(String(36), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    ticket = relationship("Ticket", back_populates="routing_decisions")
    recommended_agent = relationship("Agent", foreign_keys=[recommended_agent_id])

    def __repr__(self) -> str:
        return f"<RoutingDecision Ticket {self.ticket_id} -> Agent {self.recommended_agent_id} (Score: {self.overall_score:.2f})>"
