import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON

from app.database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    actor = Column(String(50), default="SYSTEM", nullable=False)  # SYSTEM, AGENT, ADMIN, AI, SIMULATION
    actor_id = Column(String(100), nullable=True)

    action = Column(String(100), nullable=False, index=True)  # TICKET_CREATED, CLASSIFICATION_PERFORMED, SLA_CALCULATED, RISK_PREDICTED, ROUTING_DECISION, ESCALATION_TRIGGERED, ESCALATION_APPROVED, ESCALATION_EXECUTED, SIMULATION_STARTED, INCIDENT_DETECTED, AI_RESPONSE_GENERATED
    entity = Column(String(50), nullable=False, index=True)   # ticket, agent, escalation, simulation, incident, sla_policy
    entity_id = Column(String(100), nullable=False, index=True)

    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    reason = Column(String(255), nullable=True)
    metadata_json = Column(JSON, nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity}:{self.entity_id} by {self.actor}>"
