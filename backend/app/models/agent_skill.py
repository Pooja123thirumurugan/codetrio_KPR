import uuid
from sqlalchemy import String, ForeignKey, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

# Association table between Agent and Skill
agent_skills_association = Table(
    "agent_skills_association",
    Base.metadata,
    Column("agent_id", String(36), ForeignKey("agents.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
    Column("proficiency", Integer, default=5)
)

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), default="Technical")
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    agents = relationship("Agent", secondary=agent_skills_association, back_populates="skills")
