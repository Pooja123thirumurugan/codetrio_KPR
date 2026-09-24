from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.escalation import Escalation
from app.models.ticket import Ticket
from app.services.escalation_service import escalation_service


def test_list_escalations(client: TestClient):
    """Test listing seeded pre-breach escalations."""
    response = client.get("/api/escalations")
    assert response.status_code == 200
    escalations = response.json()
    assert len(escalations) >= 1

    tck_1048_esc = [e for e in escalations if e["ticket_number"] == "TCK-1048"]
    assert len(tck_1048_esc) >= 1
    high_prob_esc = [e for e in tck_1048_esc if e["machine_reason"] == "HIGH_BREACH_PROBABILITY"]
    assert len(high_prob_esc) >= 1
    assert "Current queue pressure" in high_prob_esc[0]["human_reason"]


def test_approve_and_execute_escalation(client: TestClient, db_session: Session):
    """Test AI recommends -> Human approves -> Action executes workflow."""
    esc = db_session.query(Escalation).filter(Escalation.status == "PENDING_APPROVAL").first()
    assert esc is not None

    # 1. Approve
    approve_res = client.post(
        f"/api/escalations/{esc.id}/approve",
        json={"approved_by": "Senior Operations Lead", "notes": "Approved emergency specialist reroute"},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"
    assert approve_res.json()["approved_by"] == "Senior Operations Lead"

    # 2. Execute
    execute_res = client.post(
        f"/api/escalations/{esc.id}/execute",
        json={"action_taken": "Reassigned ticket to Priya Sharma", "notes": "Handed off successfully"},
    )
    assert execute_res.status_code == 200
    assert execute_res.json()["status"] == "EXECUTED"
    assert execute_res.json()["executed_at"] is not None


def test_manual_forced_escalation(client: TestClient):
    """Test evaluating ticket escalation with a forced trigger."""
    response = client.post(
        "/api/tickets/TCK-1048/evaluate-escalation",
        params={"force_trigger": "CAPACITY_COLLAPSE", "custom_reason": "Emergency surge staffing failure"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["trigger_type"] == "CAPACITY_COLLAPSE"
    assert "Emergency surge" in data["human_reason"]
