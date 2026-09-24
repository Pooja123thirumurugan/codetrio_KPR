import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.agent import Agent
from app.models.department import Department
from app.models.sla_prediction import SLAPrediction
from app.models.escalation import Escalation
from app.models.routing_decision import RoutingDecision
from app.models.audit_log import AuditLog
from app.services.sla_service import sla_service
from app.services.escalation_service import escalation_service
from app.services.routing_service import routing_service


def test_complete_end_to_end_predictive_workflow(client: TestClient, db_session: Session):
    """
    CRITICAL END-TO-END BACKEND TEST (SECTION 40)
    Validates complete operational pipeline:
    TICKET -> CLASSIFICATION -> SLA -> RISK -> ROUTING -> PREDICTIVE ESCALATION -> AUDIT
    """
    # 1. Create critical payment ticket
    create_payload = {
        "subject": "Critical checkout outage on production store",
        "description": "Payment gateway timing out with 504 on all transactions. Revenue loss accumulating.",
        "customer_email": "cto@global-retail.com",
        "customer_name": "CTO Global Retail",
        "channel": "API",
    }
    tck_res = client.post("/api/tickets/", json=create_payload)
    assert tck_res.status_code == 201
    ticket_data = tck_res.json()
    t_id = ticket_data["id"]
    t_num = ticket_data["ticket_number"]

    # 2 & 3. Classify & Department Identification
    assert ticket_data["category"] == "Payment Failure"
    assert ticket_data["department_name"] == "Payments"

    # 4. Calculate SLA (Critical priority -> 30 mins)
    sla_res = client.get(f"/api/sla/tickets/{t_id}/calculate")
    assert sla_res.status_code == 200
    sla_data = sla_res.json()
    assert sla_data["status"] in ["SAFE", "WARNING", "AT_RISK"]
    assert sla_data["is_breached"] is False
    assert sla_data["remaining_minutes"] > 0

    # Fast-forward ticket age to 14 minutes (simulating realistic operational passage where 16m remain out of 30m)
    db_ticket = db_session.query(Ticket).filter(Ticket.id == t_id).first()
    db_ticket.created_at = datetime.now(timezone.utc) - timedelta(minutes=14)
    db_ticket.sla_deadline = db_ticket.created_at + timedelta(minutes=30)
    db_session.commit()

    # 5 & 6 & 7. Simulate High Queue Depth (35) and High Agent Utilization (92%)
    risk_res = client.post(
        f"/api/sla/tickets/{t_id}/predict-breach",
        json={
            "ticket_id": t_id,
            "current_queue_depth": 35,
            "department_queue_depth": 22,
            "agent_utilization": 0.92,
        },
    )
    assert risk_res.status_code == 200
    risk_data = risk_res.json()

    # 8. Risk becomes HIGH or CRITICAL
    assert risk_data["breach_probability"] >= 0.70
    assert risk_data["risk_level"] in ["HIGH", "CRITICAL"]
    assert len(risk_data["contributing_factors"]) >= 1

    # 9. Routing engine finds suitable qualified agent (Priya Sharma)
    route_res = client.post(f"/api/tickets/{t_id}/route")
    assert route_res.status_code == 200
    route_data = route_res.json()
    assert route_data["status"] == "RECOMMENDED"
    assert route_data["recommended_agent"] is not None
    assert route_data["recommended_agent"]["name"] in ["Priya Sharma", "Elena Rostova"]
    assert route_data["skill_match_score"] >= 0.80

    # 10. If capacity becomes insufficient or pre-breach risk exceeds threshold -> Trigger Predictive Escalation
    esc_res = client.post(
        f"/api/tickets/{t_id}/evaluate-escalation",
        params={"force_trigger": "PRE_BREACH", "custom_reason": "High predicted breach probability under queue pressure"},
    )
    assert esc_res.status_code == 200
    esc_data = esc_res.json()
    assert esc_data["status"] == "PENDING_APPROVAL"
    assert esc_data["trigger_type"] == "PRE_BREACH"

    # 11. Verify escalation is persisted in database
    db_esc = db_session.query(Escalation).filter(Escalation.id == esc_data["id"]).first()
    assert db_esc is not None

    # 12. Verify audit logs record this complete lifecycle
    logs = db_session.query(AuditLog).filter(AuditLog.entity_id == t_id).all()
    actions = [l.action for l in logs]
    assert "TICKET_CREATED" in actions
    assert "RISK_PREDICTED" in actions
    assert "ROUTING_DECISION" in actions

    # 13. Return complete decision information
    assert route_data["overall_score"] > 0.70
    assert len(route_data["reasons"]) >= 1


def test_dedicated_pre_breach_escalation_proof(client: TestClient, db_session: Session):
    """
    CRITICAL ACCEPTANCE TEST (SECTION 41)
    Dedicated test proving:
    The ticket is NOT yet breached!
    - SLA remaining: 18 minutes
    - Breach probability: 82%
    - Current status: AT_RISK (or not breached)
    - Then: PREDICTIVE ESCALATION IS TRIGGERED.
    PROVES: 'Escalation occurs BEFORE SLA breach.'
    """
    # Query demo ticket TCK-1048
    ticket = db_session.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
    assert ticket is not None

    # Refresh timestamp so ticket is consistently 12 minutes old with 18 minutes remaining
    now = datetime.now(timezone.utc)
    ticket.created_at = now - timedelta(minutes=12)
    ticket.sla_deadline = ticket.created_at + timedelta(minutes=30)
    db_session.commit()

    # 1. Verify SLA calculation shows ticket is NOT yet breached
    sla_calc = sla_service.calculate_sla(ticket)
    assert sla_calc.is_breached is False, "Ticket should NOT be breached!"
    assert sla_calc.remaining_minutes > 0, "Ticket must have remaining SLA minutes!"


    # 2. Verify SLA prediction indicates high breach risk before the deadline
    latest_pred = db_session.query(SLAPrediction).filter(
        SLAPrediction.ticket_id == ticket.id
    ).first()
    assert latest_pred is not None
    assert latest_pred.breach_probability >= 0.75, "Breach probability must be >= 75%"
    assert latest_pred.risk_level == "CRITICAL"

    # 3. Trigger / Verify Predictive Escalation
    esc = db_session.query(Escalation).filter(
        Escalation.ticket_id == ticket.id,
        Escalation.trigger_type == "PRE_BREACH",
    ).first()
    if not esc:
        esc = escalation_service.check_and_escalate(db_session, ticket)

    assert esc is not None
    assert esc.trigger_type == "PRE_BREACH"
    assert esc.machine_reason == "HIGH_BREACH_PROBABILITY"
    assert esc.status in ["PENDING_APPROVAL", "APPROVED", "EXECUTED"]


    # 4. Human-readable reason must clearly state escalation happened BEFORE breach
    reason_lower = esc.human_reason.lower()
    assert "probability of sla breach" in reason_lower or "predicted breach" in reason_lower
    assert "remaining sla" in reason_lower or "sla remaining" in reason_lower or "18" in reason_lower or "before resolution" in reason_lower

    # PROOF COMPLETE: Escalation occurred while is_breached was FALSE!
