import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from app.models.agent_skill import agent_skills_association

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    department_id: Mapped[str] = mapped_column(String(36), ForeignKey("departments.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="AVAILABLE", nullable=False, index=True)  # AVAILABLE, BUSY, AT_CAPACITY, OFFLINE
    tier: Mapped[str] = mapped_column(String(20), default="Tier 2", nullable=False)
    avatar: Mapped[str] = mapped_column(String(255), nullable=True)

    max_capacity: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    active_ticket_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    utilization: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    average_resolution_minutes: Mapped[float] = mapped_column(Float, default=25.0, nullable=False)
    sla_breach_rate: Mapped[float] = mapped_column(Float, default=0.02, nullable=False)
    availability: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    department = relationship("Department", back_populates="agents")
    skills = relationship("Skill", secondary=agent_skills_association, back_populates="agents")
    tickets = relationship("Ticket", back_populates="assigned_agent")
