import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class SLAPolicy(Base):
    __tablename__ = "sla_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # CRITICAL, HIGH, MEDIUM, LOW
    customer_tier: Mapped[str] = mapped_column(String(40), default="Enterprise Platinum", nullable=False)
    first_response_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    resolution_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    warning_threshold_percent: Mapped[float] = mapped_column(Float, default=60.0, nullable=False)
    escalation_threshold_percent: Mapped[float] = mapped_column(Float, default=75.0, nullable=False)
    auto_escalation_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    tickets = relationship("Ticket", back_populates="sla_policy")
