import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database.base import Base


class SLAPrediction(Base):
    __tablename__ = "sla_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = Column(String(36), ForeignKey("tickets.id"), nullable=False, index=True)

    breach_probability = Column(Float, nullable=False, index=True)  # 0.0 - 1.0
    risk_level = Column(String(20), nullable=False, index=True)     # LOW, MEDIUM, HIGH, CRITICAL
    predicted_breach_time_minutes = Column(Float, nullable=True)    # Minutes until predicted breach
    confidence = Column(Float, default=0.85, nullable=False)

    # Dynamic operational state at time of prediction
    queue_depth_at_prediction = Column(Integer, default=0, nullable=False)
    department_queue_depth = Column(Integer, default=0, nullable=False)
    agent_utilization_at_prediction = Column(Float, default=0.0, nullable=False)
    sla_consumed_percent = Column(Float, default=0.0, nullable=False)
    remaining_sla_minutes = Column(Float, default=0.0, nullable=False)

    risk_velocity = Column(Float, nullable=True)  # Rate of risk increase over past predictions
    contributing_factors = Column(JSON, nullable=False)  # List of string explanations
    feature_snapshot = Column(JSON, nullable=True)       # Full feature vector dictionary

    model_version = Column(String(50), default="xgb-sla-v1.0", nullable=False)
    is_fallback = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    ticket = relationship("Ticket", back_populates="sla_predictions")

    def __repr__(self) -> str:
        return f"<SLAPrediction Ticket {self.ticket_id} - Prob: {self.breach_probability:.2f} ({self.risk_level})>"
