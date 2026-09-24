from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketClassificationResponse,
    TicketUrgencyResponse,
)
from app.schemas.ai_response import AIResponseRequest, AIResponseResult
from app.schemas.sla import SLAPredictionResponse
from app.services.ticket_service import ticket_service
from app.services.classification_service import classification_service
from app.services.urgency_service import urgency_service
from app.services.sla_service import sla_service
from app.services.ai_response_service import ai_response_service

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new support ticket. Automatically triggers classification, urgency detection,
    SLA policy assignment, and initial breach risk evaluation.
    """
    ticket = ticket_service.create_ticket(db, ticket_in)
    return ticket_service.to_response_dto(db, ticket)


@router.get("/", response_model=List[TicketResponse])
def list_tickets(
    status: Optional[str] = Query(None, description="Filter by status (OPEN, IN_PROGRESS, ESCALATED, RESOLVED)"),
    priority: Optional[str] = Query(None, description="Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)"),
    department_id: Optional[str] = Query(None, description="Filter by department ID"),
    assigned_agent_id: Optional[str] = Query(None, description="Filter by assigned agent ID"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List support tickets with filtering and pagination."""
    tickets = ticket_service.list_tickets(
        db, status=status, priority=priority, department_id=department_id, assigned_agent_id=assigned_agent_id, limit=limit, skip=skip
    )
    return [ticket_service.to_response_dto(db, t) for t in tickets]


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    """Get ticket by UUID or Ticket Number (e.g. TCK-1048) with live SLA and breach risk status."""
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")
    return ticket_service.to_response_dto(db, ticket)


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: str,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
):
    """Update ticket properties (status, priority, department, tags, etc.)."""
    ticket = ticket_service.update_ticket(db, ticket_id, ticket_in)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")
    return ticket_service.to_response_dto(db, ticket)


@router.post("/classify", response_model=TicketClassificationResponse)
def classify_ticket_text(
    subject: str = Query(..., description="Ticket subject"),
    description: str = Query(..., description="Ticket body/description"),
    channel: str = Query("WEB", description="Ticket communication channel"),
    db: Session = Depends(get_db),
):
    """Standalone endpoint to classify ticket subject and description into Category and Department."""
    return classification_service.classify_ticket(db, subject=subject, description=description, channel=channel)


@router.post("/urgency", response_model=TicketUrgencyResponse)
def evaluate_urgency(
    subject: str = Query(..., description="Ticket subject"),
    description: str = Query(..., description="Ticket body/description"),
    priority: str = Query("MEDIUM", description="Requested priority"),
    customer_tier: str = Query("STANDARD", description="Customer tier"),
):
    """Standalone endpoint to evaluate ticket urgency level, urgency score, and signal factors."""
    return urgency_service.evaluate_urgency(
        subject=subject, description=description, priority=priority, customer_tier=customer_tier
    )


@router.post("/{ticket_id}/ai-response", response_model=AIResponseResult)
def generate_ai_response(
    ticket_id: str,
    req: AIResponseRequest = AIResponseRequest(),
    db: Session = Depends(get_db),
):
    """
    Drafts an initial support response using Gemini API or high-fidelity template fallback.
    Never fails even if Gemini API is unreachable.
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    return ai_response_service.generate_response(
        db=db,
        ticket=ticket,
        tone=req.tone or "PROFESSIONAL",
        custom_instructions=req.custom_instructions,
    )


@router.get("/{ticket_id}/risk", response_model=SLAPredictionResponse)
def get_ticket_sla_risk(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    """
    Get live predictive SLA breach risk assessment for a specific ticket.
    Evaluates ML breach probability, risk level, and contributing operational factors.
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    return sla_service.predict_breach_risk(db, ticket)

