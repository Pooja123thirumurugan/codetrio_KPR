import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True, index=True)
    sla_policy_id = Column(String(36), ForeignKey("sla_policies.id"), nullable=True, index=True)
    assigned_agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True, index=True)

    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    department_name = Column(String(100), nullable=True)  # Denormalized/fallback name
    urgency = Column(String(20), default="MEDIUM", nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    priority = Column(String(20), default="MEDIUM", nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="OPEN", nullable=False, index=True)  # OPEN, IN_PROGRESS, PENDING, ESCALATED, RESOLVED, CLOSED
    channel = Column(String(30), default="WEB", nullable=False)  # WEB, EMAIL, CHAT, API, PHONE

    # SLA tracking dates
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    sla_deadline = Column(DateTime(timezone=True), nullable=True, index=True)
    first_response_deadline = Column(DateTime(timezone=True), nullable=True)
    first_responded_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    tags = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="tickets")
    department = relationship("Department", back_populates="tickets")
    sla_policy = relationship("SLAPolicy", back_populates="tickets")
    assigned_agent = relationship("Agent", back_populates="tickets")

    events = relationship("TicketEvent", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketEvent.created_at")
    sla_predictions = relationship("SLAPrediction", back_populates="ticket", cascade="all, delete-orphan", order_by="desc(SLAPrediction.created_at)")
    routing_decisions = relationship("RoutingDecision", back_populates="ticket", cascade="all, delete-orphan", order_by="desc(RoutingDecision.created_at)")
    escalations = relationship("Escalation", back_populates="ticket", cascade="all, delete-orphan", order_by="desc(Escalation.created_at)")
    ai_responses = relationship("AIResponse", back_populates="ticket", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Ticket {self.ticket_number} - {self.subject[:25]} - {self.status}>"
