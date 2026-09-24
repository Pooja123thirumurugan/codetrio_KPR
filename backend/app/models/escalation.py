import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False, index=True)

    level = Column(String(30), default="LEVEL_1", nullable=False, index=True)  # LEVEL_1, LEVEL_2, MANAGER, INCIDENT
    trigger_type = Column(String(50), nullable=False, index=True)  # PRE_BREACH, RISK_THRESHOLD, SLA_BUFFER, RISK_VELOCITY, CAPACITY_COLLAPSE, NO_ELIGIBLE_AGENT, MANUAL

    machine_reason = Column(String(100), nullable=False)  # HIGH_BREACH_PROBABILITY, SLA_DEADLINE_NEAR, RAPID_RISK_INCREASE, AGENT_CAPACITY_COLLAPSE, QUEUE_OVERLOAD, NO_ELIGIBLE_AGENT
    human_reason = Column(Text, nullable=False)           # User/evaluator-friendly explanation

    risk_probability_at_trigger = Column(Float, nullable=False)
    remaining_sla_minutes_at_trigger = Column(Float, nullable=False)

    status = Column(String(30), default="PENDING_APPROVAL", nullable=False, index=True)  # PENDING_APPROVAL, APPROVED, REJECTED, EXECUTED, CANCELLED
    suggested_actions = Column(JSON, nullable=True)  # Recommended remediation actions

    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    execution_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="escalations")

    def __repr__(self) -> str:
        return f"<Escalation {self.id} on Ticket {self.ticket_id} ({self.level} - {self.status})>"
