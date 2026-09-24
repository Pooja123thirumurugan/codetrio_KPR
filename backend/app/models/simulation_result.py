import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    simulation_id = Column(String(36), ForeignKey("simulations.id"), unique=True, nullable=False, index=True)

    initial_state = Column(JSON, nullable=False)       # Queue depth, active tickets, agent utilization
    simulated_state = Column(JSON, nullable=False)     # New predicted values under scenario
    queue_change = Column(JSON, nullable=False)        # Before vs after queue metrics
    capacity_change = Column(JSON, nullable=False)     # Before vs after agent capacity metrics
    risk_change = Column(JSON, nullable=False)         # Breach risk distribution shifts
    predicted_breaches = Column(Integer, default=0, nullable=False)
    at_risk_tickets_count = Column(Integer, default=0, nullable=False)
    recommended_actions = Column(JSON, nullable=False) # Remediation recommendations
    metrics = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    simulation = relationship("Simulation", back_populates="result")

    def __repr__(self) -> str:
        return f"<SimulationResult for Sim {self.simulation_id} - Predicted Breaches: {self.predicted_breaches}>"
