from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.incident import Incident


def test_list_incidents(client: TestClient):
    """Test listing operational incidents and recommended remediation actions."""
    response = client.get("/api/incidents/")
    assert response.status_code == 200
    incidents = response.json()
    assert len(incidents) >= 1

    first_inc = incidents[0]
    assert "incident_number" in first_inc
    assert "severity" in first_inc
    assert len(first_inc["actions"]) >= 1


def test_incident_action_approval_and_execution(client: TestClient, db_session: Session):
    """Test approving and executing non-destructive remediation action."""
    inc = db_session.query(Incident).first()
    assert inc is not None
    action = inc.actions[0]

    # Approve
    app_res = client.post(
        f"/api/incidents/actions/{action.id}/approve",
        json={"approved_by": "Incident Commander"},
    )
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "APPROVED"

    # Execute
    exec_res = client.post(
        f"/api/incidents/actions/{action.id}/execute",
        json={"notes": "Fast-tracked 4 critical payment tickets"},
    )
    assert exec_res.status_code == 200
    assert exec_res.json()["status"] == "EXECUTED"
    assert exec_res.json()["executed_at"] is not None


def test_scan_incidents_endpoint(client: TestClient):
    """Test operational scanner endpoint."""
    response = client.post("/api/incidents/scan")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
