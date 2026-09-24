import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.base import Base


class IncidentAction(Base):
    __tablename__ = "incident_actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False, index=True)

    action_type = Column(String(50), nullable=False)  # REASSIGN_TICKETS, ACTIVATE_AGENTS, PRIORITIZE_CRITICAL, ESCALATE_HIGH_RISK, INCREASE_CAPACITY, ROUTE_OVERFLOW
    description = Column(String(255), nullable=False)
    priority = Column(Integer, default=1, nullable=False)
    status = Column(String(30), default="RECOMMENDED", nullable=False)  # RECOMMENDED, APPROVED, EXECUTED, SKIPPED

    approved_by = Column(String(100), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    result_summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    incident = relationship("Incident", back_populates="actions")

    def __repr__(self) -> str:
        return f"<IncidentAction {self.action_type} for Incident {self.incident_id}>"
