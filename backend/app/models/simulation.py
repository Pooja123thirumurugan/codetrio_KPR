import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario = Column(String(50), nullable=False, index=True)  # NORMAL_LOAD, TICKET_SPIKE, AGENT_FAILURE, QUEUE_OVERLOAD, SLA_TIGHTENING, CRITICAL_SURGE, RECOVERY, CUSTOM
    parameters = Column(JSON, nullable=False)  # {"additional_tickets": 50, "agent_reduction": 2, "sla_change_percent": -20}
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, RUNNING, COMPLETED, FAILED

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    result = relationship("SimulationResult", back_populates="simulation", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Simulation {self.id} ({self.scenario})>"
