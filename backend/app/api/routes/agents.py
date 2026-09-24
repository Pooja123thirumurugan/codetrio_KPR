from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.agent import Agent
from app.models.agent_skill import Skill
from app.models.department import Department
from app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentCapacityResponse,
)

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("/", response_model=List[AgentResponse])
def list_agents(
    department_id: Optional[str] = Query(None, description="Filter by department"),
    status: Optional[str] = Query(None, description="Filter by status (AVAILABLE, BUSY, AT_CAPACITY, OFFLINE)"),
    db: Session = Depends(get_db),
):
    """List support agents with department, active load, utilization, and skills."""
    q = db.query(Agent)
    if department_id:
        q = q.filter(Agent.department_id == department_id)
    if status:
        q = q.filter(Agent.status == status.upper())

    agents = q.all()
    # Enrich with department name
    results = []
    for a in agents:
        resp = AgentResponse.model_validate(a)
        resp.department_name = a.department.name if a.department else None
        results.append(resp)
    return results


@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
):
    """Get single agent details by ID."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent {agent_id} not found")

    resp = AgentResponse.model_validate(agent)
    resp.department_name = agent.department.name if agent.department else None
    return resp


@router.get("/{agent_id}/capacity", response_model=AgentCapacityResponse)
def get_agent_capacity(
    agent_id: str,
    db: Session = Depends(get_db),
):
    """Get agent real-time capacity and utilization breakdown."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent {agent_id} not found")

    avail_capacity = max(0, agent.max_capacity - agent.active_ticket_count)
    utilization = round(agent.active_ticket_count / max(1, agent.max_capacity), 2)
    is_at_cap = (agent.active_ticket_count >= agent.max_capacity) or (agent.status == "AT_CAPACITY")
    is_avail = (agent.status == "AVAILABLE" or agent.status == "BUSY") and not is_at_cap and agent.availability

    return AgentCapacityResponse(
        agent_id=agent.id,
        name=agent.name,
        status=agent.status,
        max_capacity=agent.max_capacity,
        active_ticket_count=agent.active_ticket_count,
        available_capacity=avail_capacity,
        utilization=utilization,
        is_at_capacity=is_at_cap,
        is_available=is_avail,
    )


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(
    agent_in: AgentCreate,
    db: Session = Depends(get_db),
):
    """Create a new support agent with optional skills and capacity settings."""
    existing = db.query(Agent).filter(Agent.email == agent_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    agent = Agent(
        name=agent_in.name,
        email=agent_in.email,
        department_id=agent_in.department_id,
        status=agent_in.status,
        max_capacity=agent_in.max_capacity,
        active_ticket_count=agent_in.active_ticket_count,
        utilization=agent_in.utilization,
        average_resolution_minutes=agent_in.average_resolution_minutes,
        sla_breach_rate=agent_in.sla_breach_rate,
        availability=agent_in.availability,
    )

    # Attach skills
    if agent_in.skill_names:
        for s_name in agent_in.skill_names:
            skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
            if not skill:
                skill = Skill(name=s_name)
                db.add(skill)
                db.flush()
            agent.skills.append(skill)

    db.add(agent)
    db.commit()
    db.refresh(agent)

    resp = AgentResponse.model_validate(agent)
    resp.department_name = agent.department.name if agent.department else None
    return resp


@router.patch("/{agent_id}", response_model=AgentResponse)
def update_agent(
    agent_id: str,
    agent_in: AgentUpdate,
    db: Session = Depends(get_db),
):
    """Update agent capacity, status, or details."""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Agent {agent_id} not found")

    data = agent_in.model_dump(exclude_unset=True)
    skill_names = data.pop("skill_names", None)

    for field, val in data.items():
        setattr(agent, field, val)

    if skill_names is not None:
        agent.skills = []
        for s_name in skill_names:
            skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
            if not skill:
                skill = Skill(name=s_name)
                db.add(skill)
                db.flush()
            agent.skills.append(skill)

    # Recompute utilization
    agent.utilization = round(agent.active_ticket_count / max(1, agent.max_capacity), 2)
    if agent.active_ticket_count >= agent.max_capacity:
        agent.status = "AT_CAPACITY"

    db.commit()
    db.refresh(agent)

    resp = AgentResponse.model_validate(agent)
    resp.department_name = agent.department.name if agent.department else None
    return resp
