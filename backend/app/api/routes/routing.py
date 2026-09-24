from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db
from app.models.routing_decision import RoutingDecision
from app.models.department import Department
from app.schemas.routing import (
    RouteTicketRequest,
    RoutingDecisionResponse,
    RecommendedAgentSummary,
    AlternativeAgentSummary,
)
from app.services.ticket_service import ticket_service
from app.services.routing_service import routing_service
from app.services.sla_service import sla_service

router = APIRouter(tags=["Routing"])


@router.post("/tickets/{ticket_id}/route", response_model=RoutingDecisionResponse)
def route_ticket(
    ticket_id: str,
    req: RouteTicketRequest = RouteTicketRequest(),
    db: Session = Depends(get_db),
):
    """
    Execute intelligent multi-factor agent routing (skills 30%, capacity 25%, SLA 20%, queue 15%, history 10%).
    Strictly respects agent capacity constraints and recommends alternatives or pre-breach escalation.
    """
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    return routing_service.route_ticket(
        db=db,
        ticket=ticket,
        force_agent_id=req.force_agent_id,
        allow_overcapacity=req.allow_overcapacity or False,
    )


@router.get("/tickets/{ticket_id}/routing", response_model=RoutingDecisionResponse)
def get_latest_routing(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    """Get the latest routing decision and explanation for a ticket."""
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Ticket {ticket_id} not found")

    decision = db.query(RoutingDecision).filter(
        RoutingDecision.ticket_id == ticket.id
    ).order_by(desc(RoutingDecision.created_at)).first()

    if not decision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No routing decision recorded for this ticket")

    agent_summary = None
    if decision.recommended_agent:
        a = decision.recommended_agent
        agent_summary = RecommendedAgentSummary(
            id=a.id,
            name=a.name,
            department_name=a.department.name if a.department else None,
            utilization=a.utilization,
            active_ticket_count=a.active_ticket_count,
            max_capacity=a.max_capacity,
            sla_breach_rate=a.sla_breach_rate,
        )

    alternatives = []
    for alt in (decision.alternatives or []):
        if isinstance(alt, dict):
            alternatives.append(AlternativeAgentSummary(
                agent_id=str(alt.get("agent_id", "")),
                name=str(alt.get("name", "Unknown")),
                score=float(alt.get("score", 0.0)),
                skill_match_score=float(alt.get("skill_match_score", 0.0)),
                capacity_score=float(alt.get("capacity_score", 0.0)),
                sla_suitability_score=float(alt.get("sla_suitability_score", 0.0)),
                queue_load_score=float(alt.get("queue_load_score", 0.0)),
                historical_performance_score=float(alt.get("historical_performance_score", 0.0)),
                reasons=list(alt.get("reasons", [])),
            ))

    return RoutingDecisionResponse(
        id=decision.id,
        ticket_id=ticket.id,
        recommended_agent=agent_summary,
        status=decision.status,
        overall_score=decision.overall_score,
        confidence=decision.confidence,
        skill_match_score=decision.skill_match_score,
        capacity_score=decision.capacity_score,
        sla_suitability_score=decision.sla_suitability_score,
        queue_load_score=decision.queue_load_score,
        historical_performance_score=decision.historical_performance_score,
        reasons=decision.reasons or [],
        alternatives=alternatives,
        created_at=decision.created_at,
    )


@router.get("/departments/{department_id}/queue")
def get_department_queue(
    department_id: str,
    db: Session = Depends(get_db),
):
    """Get queue depth, capacity, and active load for a specific department."""
    dept = db.query(Department).filter(
        (Department.id == department_id) | (Department.name.ilike(department_id))
    ).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Department {department_id} not found")

    queue_state = sla_service.get_live_queue_state(db, dept.id)
    return {
        "department_id": dept.id,
        "department_name": dept.name,
        **queue_state,
    }
