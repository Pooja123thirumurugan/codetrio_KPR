import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(20), default="HIGH", nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, SEV_1, SEV_2, SEV_3
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True, index=True)
    trigger = Column(String(50), nullable=False, index=True)  # QUEUE_OVERLOAD, CRITICAL_SPIKE, AGENT_FAILURE, PREDICTED_BREACH_SPIKE, CAPACITY_COLLAPSE, MANUAL

    status = Column(String(30), default="DETECTED", nullable=False, index=True)  # DETECTED, INVESTIGATING, MITIGATING, RESOLVED, CLOSED
    current_state = Column(JSON, nullable=False)  # Snapshot of metrics triggering incident
    detected_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    department = relationship("Department")
    actions = relationship("IncidentAction", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentAction.priority")

    def __repr__(self) -> str:
        return f"<Incident {self.incident_number}: {self.title} ({self.severity})>"
