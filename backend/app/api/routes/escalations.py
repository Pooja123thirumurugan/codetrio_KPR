from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db
from app.models.escalation import Escalation
from app.schemas.escalation import (
    EscalationResponse,
    EscalationApprovalRequest,
    EscalationExecutionRequest,
)
from app.services.ticket_service import ticket_service
from app.services.escalation_service import escalation_service

router = APIRouter(tags=["Escalations"])


@router.get("/escalations", response_model=List[EscalationResponse])
@router.get("/escalations/", response_model=List[EscalationResponse], include_in_schema=False)
def list_escalations(
    status: Optional[str] = Query(None, description="Filter by status (PENDING_APPROVAL, APPROVED, EXECUTED)"),
    level: Optional[str] = Query(None, description="Filter by level (LEVEL_1, LEVEL_2, MANAGER, INCIDENT)"),
    db: Session = Depends(get_db),
):
    """List predictive escalations and human approval requests."""
    q = db.query(Escalation)
    if status:
        q = q.filter(Escalation.status == status.upper())
    if level:
        q = q.filter(Escalation.level == level.upper())

    escalations = q.order_by(desc(Escalation.created_at)).all()
    results = []
    for e in escalations:
        resp = EscalationResponse.model_validate(e)
        if e.ticket:
            resp.ticket_number = e.ticket.ticket_number
            resp.ticket_subject = e.ticket.subject
        results.append(resp)
    return results


@router.get("/escalations/{escalation_id}", response_model=EscalationResponse)
def get_escalation(
    escalation_id: str,
    db: Session = Depends(get_db),
):
    """Get single escalation details with machine and human reasons."""
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Escalation {escalation_id} not found")

    resp = EscalationResponse.model_validate(esc)
    if esc.ticket:
        resp.ticket_number = esc.ticket.ticket_number
        resp.ticket_subject = esc.ticket.subject
    return resp


@router.post("/tickets/{ticket_id}/evaluate-escalation", response_model=Optional[EscalationResponse])
def evaluate_ticket_escalation(
    ticket_id: str,
    force_trigger: Optional[str] = Query(None, description="Optional manual or forced trigger"),
    custom_reason: Optional[str] = Query(None, description="Optional custom trigger reason"),
    db: Session = Depends(get_db),
):
    """
    Evaluates pre-breach predictive escalation conditions for a ticket.
    Escalates BEFORE the ticket breaches its SLA deadline!
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    esc = escalation_service.check_and_escalate(
        db=db,
        ticket=ticket,
        force_trigger=force_trigger,
        custom_reason=custom_reason,
    )
    if not esc:
        return None

    resp = EscalationResponse.model_validate(esc)
    if esc.ticket:
        resp.ticket_number = esc.ticket.ticket_number
        resp.ticket_subject = esc.ticket.subject
    return resp


@router.post("/escalations/{escalation_id}/approve", response_model=EscalationResponse)
def approve_escalation(
    escalation_id: str,
    req: EscalationApprovalRequest = EscalationApprovalRequest(),
    db: Session = Depends(get_db),
):
    """Human supervisor approves recommended pre-breach escalation."""
    try:
        esc = escalation_service.approve_escalation(
            db=db,
            escalation_id=escalation_id,
            approved_by=req.approved_by,
            notes=req.notes,
        )
        resp = EscalationResponse.model_validate(esc)
        if esc.ticket:
            resp.ticket_number = esc.ticket.ticket_number
            resp.ticket_subject = esc.ticket.subject
        return resp
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/escalations/{escalation_id}/execute", response_model=EscalationResponse)
def execute_escalation(
    escalation_id: str,
    req: EscalationExecutionRequest,
    db: Session = Depends(get_db),
):
    """Executes the approved remediation action for an escalation."""
    try:
        esc = escalation_service.execute_escalation(
            db=db,
            escalation_id=escalation_id,
            action_taken=req.action_taken,
            target_agent_id=req.target_agent_id,
            notes=req.notes,
        )
        resp = EscalationResponse.model_validate(esc)
        if esc.ticket:
            resp.ticket_number = esc.ticket.ticket_number
            resp.ticket_subject = esc.ticket.subject
        return resp
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
