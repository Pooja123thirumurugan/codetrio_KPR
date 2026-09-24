from fastapi.testclient import TestClient


def test_ticket_creation_and_auto_classification(client: TestClient):
    """Test creating a ticket with automated classification and urgency detection."""
    payload = {
        "subject": "Checkout credit card transaction failing with 500 error",
        "description": "Customer unable to complete checkout on payment gateway. Getting error 500.",
        "customer_email": "jane.doe@enterprise.com",
        "customer_name": "Jane Doe",
        "channel": "WEB",
    }
    response = client.post("/api/tickets/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["ticket_number"].startswith("TCK-")
    assert data["category"] == "Payment Failure" or data["department_name"] == "Payments"
    assert data["status"] == "OPEN"
    assert data["sla_deadline"] is not None
    assert data["remaining_sla_minutes"] > 0


def test_ticket_retrieval_by_number(client: TestClient, db_session):
    """Test retrieving demo ticket TCK-1048 by ticket number."""
    from datetime import datetime, timezone, timedelta
    from app.models.ticket import Ticket
    ticket = db_session.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
    if ticket:
        now = datetime.now(timezone.utc)
        ticket.created_at = now - timedelta(minutes=12)
        ticket.sla_deadline = ticket.created_at + timedelta(minutes=30)
        db_session.commit()

    response = client.get("/api/tickets/TCK-1048")
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_number"] == "TCK-1048"
    assert data["priority"] == "CRITICAL"
    assert data["category"] == "Payment Failure"
    assert data["department_name"] == "Payments"
    assert data["sla_status"] in ["AT_RISK", "WARNING", "SAFE"]



def test_ticket_update(client: TestClient):
    """Test updating ticket status to IN_PROGRESS and RESOLVED."""
    # Create a ticket first
    create_res = client.post("/api/tickets/", json={
        "subject": "Need invoice copy for April billing",
        "description": "Please provide invoice PDF",
        "customer_email": "test.user@acme.com",
    })
    ticket_id = create_res.json()["id"]

    # Update to IN_PROGRESS
    update_res = client.patch(f"/api/tickets/{ticket_id}", json={"status": "IN_PROGRESS"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "IN_PROGRESS"

    # Update to RESOLVED
    resolve_res = client.patch(f"/api/tickets/{ticket_id}", json={"status": "RESOLVED"})
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"
    assert resolve_res.json()["resolved_at"] is not None


def test_invalid_ticket_not_found(client: TestClient):
    """Test 404 response when querying non-existent ticket."""
    response = client.get("/api/tickets/NON_EXISTENT_TCK_9999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
