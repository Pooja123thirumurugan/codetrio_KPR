from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.ai_response import AIResponseRequest, AIResponseResult
from app.services.ticket_service import ticket_service
from app.services.ai_response_service import ai_response_service

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/draft-response", response_model=AIResponseResult)
def draft_ai_response(
    ticket_id: str = Query(..., description="ID or Number of the ticket"),
    tone: str = Query("PROFESSIONAL", description="Tone (PROFESSIONAL, EMPATHETIC, URGENT, TECHNICAL)"),
    custom_instructions: Optional[str] = Query(None, description="Custom prompt instructions"),
    db: Session = Depends(get_db),
):
    """
    Generate auto-drafted response for any ticket using Gemini API with deterministic fallback.
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    return ai_response_service.generate_response(
        db=db,
        ticket=ticket,
        tone=tone,
        custom_instructions=custom_instructions,
    )
