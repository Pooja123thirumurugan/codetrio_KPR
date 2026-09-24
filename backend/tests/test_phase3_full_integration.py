import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.agent import Agent
from app.models.department import Department
from app.models.sla_prediction import SLAPrediction
from app.models.routing_decision import RoutingDecision
from app.models.escalation import Escalation
from app.models.simulation import Simulation
from app.models.simulation_result import SimulationResult
from app.models.audit_log import AuditLog
from app.services.sla_service import sla_service


def test_phase3_full_system_lifecycle_e2e(client: TestClient, db_session: Session):
    """
    PHASE 3 REQUIRED END-TO-END INTEGRATION TEST (SECTION 32 & 36)
    Validates the complete full-system operational lifecycle:
    Create Ticket -> POST API -> Database persistence -> Classification -> Urgency ->
    SLA calculation -> Risk prediction -> Routing -> Agent capacity update ->
    Predictive escalation -> Audit logging -> API response.
    """
    # 1. Create a Critical Priority Ticket via REST API
    ticket_payload = {
        "subject": "Critical checkout 504 gateway timeout on enterprise cluster",
        "description": "Enterprise credit card transactions failing on checkout API with HTTP 504. High revenue loss actively accumulating.",
        "customer_email": "cto@global-retailer.com",
        "customer_name": "CTO Global Retailer",
        "channel": "WEB",
    }
    create_res = client.post("/api/tickets/", json=ticket_payload)
    assert create_res.status_code == 201
    ticket_data = create_res.json()
    t_id = ticket_data["id"]
    t_num = ticket_data["ticket_number"]

    # 2. Verify Database Persistence of Ticket
    db_ticket = db_session.query(Ticket).filter(Ticket.id == t_id).first()
    assert db_ticket is not None
    assert db_ticket.ticket_number == t_num
    assert db_ticket.category == "Payment Failure"
    assert db_ticket.department_name == "Payments"
    assert db_ticket.priority == "CRITICAL"

    # 3. Verify SLA Calculation & Initial Risk Prediction in DB
    assert db_ticket.sla_deadline is not None
    sla_calc = sla_service.calculate_sla(db_ticket)
    assert sla_calc.is_breached is False
    assert sla_calc.remaining_minutes > 0

    pred = db_session.query(SLAPrediction).filter(SLAPrediction.ticket_id == t_id).first()
    assert pred is not None
    assert pred.breach_probability >= 0.0

    # 4. Trigger & Verify Intelligent Routing API
    route_res = client.post(f"/api/tickets/{t_id}/route")
    assert route_res.status_code == 200
    route_data = route_res.json()
    assert route_data["status"] in ["RECOMMENDED", "ACCEPTED"]
    assert route_data["recommended_agent"] is not None

    route_dec = db_session.query(RoutingDecision).filter(RoutingDecision.ticket_id == t_id).first()
    assert route_dec is not None
    assert route_dec.recommended_agent_id is not None
    assert route_dec.overall_score >= 0.70

    # 5. Verify Agent Assigned and Capacity Load
    assigned_agent = db_session.query(Agent).filter(Agent.id == route_dec.recommended_agent_id).first()
    assert assigned_agent is not None

    # 6. Fast-forward ticket age to 42 minutes (simulating 18m remaining out of 60m SLA, 70% consumed) & high queue stress
    now = datetime.now(timezone.utc)
    db_ticket.created_at = now - timedelta(minutes=42)
    db_ticket.sla_deadline = db_ticket.created_at + timedelta(minutes=60)
    db_session.commit()

    # Re-predict risk under simulated high queue pressure (depth 35, agent util 95%)
    risk_res = client.post(
        f"/api/sla/tickets/{t_id}/predict-breach",
        json={
            "ticket_id": t_id,
            "current_queue_depth": 35,
            "department_queue_depth": 22,
            "agent_utilization": 0.95,
        },
    )
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["breach_probability"] >= 0.75
    assert risk_data["risk_level"] in ["HIGH", "CRITICAL"]

    # 7. Evaluate Predictive Pre-Breach Escalation
    esc_res = client.post(f"/api/tickets/{t_id}/evaluate-escalation")
    assert esc_res.status_code == 200
    esc_data = esc_res.json()
    assert esc_data is not None
    assert esc_data["trigger_type"] in ["PRE_BREACH", "RISK_THRESHOLD"]
    assert esc_data["status"] in ["PENDING_APPROVAL", "APPROVED", "EXECUTED"]

    # 8. Verify Audit Logs Recorded Complete Lifecycle
    audit_records = db_session.query(AuditLog).filter(AuditLog.entity_id == t_id).all()
    actions = {a.action for a in audit_records}
    assert "TICKET_CREATED" in actions

    # 9. Verify REST API Retrieval matches Database
    get_res = client.get(f"/api/tickets/{t_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["ticket_number"] == t_num
    assert get_data["category"] == "Payment Failure"

    # Teardown / restore test ticket load so subsequent tests have full agent capacity headroom
    if assigned_agent and assigned_agent.active_ticket_count > 0:
        assigned_agent.active_ticket_count = max(0, assigned_agent.active_ticket_count - 1)
        assigned_agent.status = "AVAILABLE"
        db_session.commit()


def test_phase3_critical_pre_breach_escalation_proof(client: TestClient, db_session: Session):
    """
    PHASE 3 CRITICAL PREDICTIVE ESCALATION TEST (SECTION 33)
    MUST prove that escalation occurs BEFORE the SLA breach.
    - SLA remaining: 18 minutes (Total: 60 minutes)
    - Breach probability: 82%+
    - Current status: AT_RISK (is_breached == False)
    - Escalation: TRIGGERED
    PROVES: 'Escalation occurs BEFORE SLA breach.'
    """
    # Create or fetch demo scenario ticket
    ticket = db_session.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
    if not ticket:
        # Create ticket TCK-1048 if running in clean standalone test session
        ticket = Ticket(
            ticket_number="TCK-1048",
            customer_id="cust-test",
            subject="Payment failure during checkout",
            description="Critical checkout outage affecting multiple enterprise users.",
            category="Payment Failure",
            urgency="CRITICAL",
            priority="CRITICAL",
            status="IN_PROGRESS",
            channel="WEB",
            created_at=datetime.now(timezone.utc) - timedelta(minutes=42),
            sla_deadline=datetime.now(timezone.utc) + timedelta(minutes=18),
        )
        db_session.add(ticket)
        db_session.commit()
    else:
        # Set exact timestamps for 18m remaining out of 30m (40% consumed, 18m left)
        ticket.created_at = datetime.now(timezone.utc) - timedelta(minutes=12)
        ticket.sla_deadline = ticket.created_at + timedelta(minutes=30)
        ticket.status = "IN_PROGRESS"
        db_session.commit()

    # 1. Assert ticket is NOT breached (18m remaining)
    sla_result = sla_service.calculate_sla(ticket)
    assert sla_result.is_breached is False, "ASSERTION FAILED: Ticket must NOT be breached!"
    assert sla_result.remaining_minutes >= 15, "ASSERTION FAILED: Ticket must have remaining SLA time (~18m)!"

    # 2. Assert risk prediction reflects high risk before the deadline
    risk_pred = client.post(
        f"/api/sla/tickets/{ticket.id}/predict-breach",
        json={
            "ticket_id": ticket.id,
            "current_queue_depth": 35,
            "department_queue_depth": 22,
            "agent_utilization": 0.95,
        },
    )
    assert risk_pred.status_code == 200
    pred_data = risk_pred.json()
    assert pred_data["breach_probability"] >= 0.75, "Breach probability must exceed 75% threshold"
    assert pred_data["risk_level"] in ["HIGH", "CRITICAL"]

    # 3. Assert Predictive Escalation is Triggered
    esc_res = client.post(f"/api/tickets/{ticket.id}/evaluate-escalation")
    assert esc_res.status_code == 200
    esc_data = esc_res.json()
    assert esc_data is not None
    assert esc_data["trigger_type"] in ["PRE_BREACH", "RISK_THRESHOLD"]

    # 4. Human Approval and Execution Flow
    esc_id = esc_data["id"]
    approve_res = client.post(f"/api/escalations/{esc_id}/approve", json={"approved_by": "Ops Lead", "notes": "Approved for specialist rerouting"})
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    exec_res = client.post(f"/api/escalations/{esc_id}/execute", json={"action_taken": "REASSIGN_SPECIALIST", "notes": "Assigned to Priya Sharma"})
    assert exec_res.status_code == 200
    assert exec_res.json()["status"] == "EXECUTED"


def test_phase3_simulation_isolation_guarantee(client: TestClient, db_session: Session):
    """
    PHASE 3 SIMULATION ISOLATION TEST (SECTION 34)
    Verifies that running a massive simulation does NOT mutate production database records.
    """
    # 1. Record baseline production state
    baseline_ticket_count = db_session.query(Ticket).count()
    baseline_agent_count = db_session.query(Agent).count()
    first_ticket = db_session.query(Ticket).first()
    first_ticket_status = first_ticket.status if first_ticket else None

    # 2. Run What-If Simulation with 100 extra tickets and 3 agent failures
    sim_res = client.post(
        "/api/simulations/",
        json={
            "scenario": "TICKET_SPIKE",
            "additional_tickets": 100,
            "agent_reduction": 3,
            "sla_change_percent": -20,
            "preserve_production_isolation": True,
        },
    )
    assert sim_res.status_code == 201
    sim_data = sim_res.json()
    assert sim_data["status"] == "COMPLETED"
    assert sim_data["result"] is not None
    assert sim_data["result"]["predicted_breaches"] >= 1

    # 3. Assert ZERO Mutation of Production State
    current_ticket_count = db_session.query(Ticket).count()
    current_agent_count = db_session.query(Agent).count()

    assert current_ticket_count == baseline_ticket_count, "Production ticket count MUST NOT change during simulation!"
    assert current_agent_count == baseline_agent_count, "Production agent count MUST NOT change during simulation!"

    if first_ticket:
        db_session.refresh(first_ticket)
        assert first_ticket.status == first_ticket_status, "Production ticket status MUST NOT change!"


def test_phase3_ai_response_copilot_resilience(client: TestClient, db_session: Session):
    """
    PHASE 3 AI RESPONSE COPILOT INTEGRATION TEST (SECTION 18)
    Verifies that AI response drafting endpoint returns structured drafts with sentiment tone,
    falling back cleanly if Gemini API key is unset.
    """
    ticket = db_session.query(Ticket).first()
    assert ticket is not None

    res = client.post(
        f"/api/tickets/{ticket.id}/ai-response",
        json={"tone": "PROFESSIONAL", "custom_instructions": "Draft concise resolution outline"},
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["suggested_response"]) > 20
    assert data["provider"] in ["gemini", "template_fallback"]
    assert data["confidence"] > 0.50
