from fastapi.testclient import TestClient


def test_critical_outage_urgency_detection(client: TestClient):
    """Test urgency detector identifying a critical production outage."""
    response = client.post(
        "/api/tickets/urgency",
        params={
            "subject": "CRITICAL: Complete system down, multiple customers unable to pay",
            "description": "Production checkout broken, revenue loss accumulating immediately for thousands of users.",
            "priority": "CRITICAL",
            "customer_tier": "ENTERPRISE",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] == "CRITICAL"
    assert data["urgency_score"] >= 0.75
    assert len(data["detected_signals"]) >= 2
    assert "critical" in data["explanation"].lower() or "outage" in data["explanation"].lower()


def test_normal_informational_urgency_detection(client: TestClient):
    """Test urgency detector identifying a normal low-urgency question."""
    response = client.post(
        "/api/tickets/urgency",
        params={
            "subject": "Question about invoice format",
            "description": "Could you clarify the tax format breakdown on our previous receipt?",
            "priority": "LOW",
            "customer_tier": "STANDARD",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] in ["LOW", "MEDIUM"]
    assert data["urgency_score"] < 0.50
    assert "explanation" in data
