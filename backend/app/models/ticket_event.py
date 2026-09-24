import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class TicketEvent(Base):
    __tablename__ = "ticket_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # CREATED, CLASSIFIED, SLA_CALCULATED, RISK_PREDICTED, ROUTED, ESCALATED, STATUS_CHANGED, RESOLVED, NOTE_ADDED
    actor = Column(String(50), default="SYSTEM", nullable=False)  # SYSTEM, AGENT, CUSTOMER, AI, ADMIN
    actor_id = Column(String(100), nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    ticket = relationship("Ticket", back_populates="events")

    def __repr__(self) -> str:
        return f"<TicketEvent {self.event_type} on Ticket {self.ticket_id}>"
