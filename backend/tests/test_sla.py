from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.sla_policy import SLAPolicy
from app.services.sla_service import sla_service


def test_sla_policy_selection(client: TestClient):
    """Test policy selection for critical enterprise vs low standard."""
    response = client.get("/api/sla/policies")
    assert response.status_code == 200
    policies = response.json()
    assert len(policies) >= 3

    critical_policies = [p for p in policies if p["priority"] == "CRITICAL"]
    assert len(critical_policies) >= 1
    assert critical_policies[0]["resolution_minutes"] <= 30


def test_sla_deadline_and_consumed_calculation(client: TestClient):
    """Test SLA calculation on demo ticket TCK-1048."""
    response = client.get("/api/sla/tickets/TCK-1048/calculate")
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_number"] == "TCK-1048"
    assert data["deadline"] is not None
    assert data["remaining_minutes"] >= 0
    assert data["consumed_percent"] >= 0
    assert data["status"] in ["SAFE", "WARNING", "AT_RISK", "BREACHED"]


def test_sla_at_risk_state_detected(db_session: Session):
    """Verify that AT_RISK state triggers before breach when SLA is nearing deadline."""
    # Create ticket created 26 minutes ago with 30-min SLA (4m left -> AT_RISK)
    now = datetime.now(timezone.utc)
    policy = db_session.query(SLAPolicy).filter(SLAPolicy.priority == "CRITICAL").first()
    cust = db_session.query(Ticket).first().customer

    import uuid
    ticket = Ticket(
        ticket_number=f"TCK-TEST-RISK-{uuid.uuid4().hex[:6]}",
        customer_id=cust.id,
        subject="At risk test ticket",
        description="Testing SLA calculation",
        priority="CRITICAL",
        sla_policy_id=policy.id,
        created_at=now - timedelta(minutes=26),
        sla_deadline=now + timedelta(minutes=4),
    )
    db_session.add(ticket)
    db_session.commit()

    calc = sla_service.calculate_sla(ticket)
    assert calc.is_at_risk is True
    assert calc.is_breached is False
    assert calc.status == "AT_RISK"
    assert calc.remaining_minutes <= 10.0


def test_sla_breached_state_detected(db_session: Session):
    """Verify that BREACHED state triggers when deadline has passed."""
    import uuid
    now = datetime.now(timezone.utc)
    policy = db_session.query(SLAPolicy).filter(SLAPolicy.priority == "CRITICAL").first()
    cust = db_session.query(Ticket).first().customer

    ticket = Ticket(
        ticket_number=f"TCK-TEST-BREACHED-{uuid.uuid4().hex[:6]}",
        customer_id=cust.id,
        subject="Breached test ticket",
        description="Testing breached SLA calculation",
        priority="CRITICAL",
        sla_policy_id=policy.id,
        created_at=now - timedelta(minutes=45),
        sla_deadline=now - timedelta(minutes=15),
    )

    db_session.add(ticket)
    db_session.commit()

    calc = sla_service.calculate_sla(ticket)
    assert calc.is_breached is True
    assert calc.status == "BREACHED"
