from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.sla_policy import SLAPolicy
from app.schemas.sla import (
    SLAPolicyCreate,
    SLAPolicyUpdate,
    SLAPolicyResponse,
    SLACalculationResult,
    SLAPredictionRequest,
    SLAPredictionResponse,
)
from app.services.ticket_service import ticket_service
from app.services.sla_service import sla_service

router = APIRouter(prefix="/sla", tags=["SLA"])


@router.get("/policies", response_model=List[SLAPolicyResponse])
def list_sla_policies(db: Session = Depends(get_db)):
    """List all configurable SLA policies."""
    return db.query(SLAPolicy).all()


@router.post("/policies", response_model=SLAPolicyResponse, status_code=status.HTTP_201_CREATED)
def create_sla_policy(policy_in: SLAPolicyCreate, db: Session = Depends(get_db)):
    """Create a new SLA policy."""
    policy = SLAPolicy(**policy_in.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/policies/{policy_id}", response_model=SLAPolicyResponse)
def get_sla_policy(policy_id: str, db: Session = Depends(get_db)):
    """Get single SLA policy details."""
    policy = db.query(SLAPolicy).filter(SLAPolicy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SLA Policy not found")
    return policy


@router.get("/tickets/{ticket_id}/calculate", response_model=SLACalculationResult)
def calculate_ticket_sla(ticket_id: str, db: Session = Depends(get_db)):
    """
    Calculate dynamic SLA deadline, consumed %, remaining time, and status
    (SAFE, WARNING, AT_RISK, BREACHED).
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    return sla_service.calculate_sla(ticket)


@router.post("/tickets/{ticket_id}/predict-breach", response_model=SLAPredictionResponse)
def predict_sla_breach(
    ticket_id: str,
    req: Optional[SLAPredictionRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Predicts SLA breach risk probability, risk level, and contributing factors.
    Dynamically responds to live queue depth and agent utilization.
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    q_depth = req.current_queue_depth if req else None
    dept_q = req.department_queue_depth if req else None
    agent_util = req.agent_utilization if req else None

    return sla_service.predict_breach_risk(
        db=db,
        ticket=ticket,
        current_queue_depth=q_depth,
        department_queue_depth=dept_q,
        agent_utilization=agent_util,
    )
