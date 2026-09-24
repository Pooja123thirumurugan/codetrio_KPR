from fastapi.testclient import TestClient


def test_payment_classification(client: TestClient):
    """Test classification of payment failure query."""
    response = client.post(
        "/api/tickets/classify",
        params={
            "subject": "Credit card declined at checkout with gateway timeout",
            "description": "User cannot complete checkout, payment transaction fails.",
            "channel": "WEB",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Payment Failure"
    assert data["department"] == "Payments"
    assert data["confidence"] >= 0.70


def test_authentication_classification(client: TestClient):
    """Test classification of SSO login failure query."""
    response = client.post(
        "/api/tickets/classify",
        params={
            "subject": "User locked out after resetting corporate SSO password",
            "description": "2FA multi-factor authentication SMS code is not delivered.",
            "channel": "WEB",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Authentication"
    assert data["department"] == "Account Support"
    assert data["confidence"] >= 0.70


def test_technical_issue_classification(client: TestClient):
    """Test classification of technical error query."""
    response = client.post(
        "/api/tickets/classify",
        params={
            "subject": "REST API returns 500 internal server error on endpoint",
            "description": "Server stack trace shows connection pool exhaustion bug.",
            "channel": "API",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Technical Issue"
    assert data["department"] == "Technical Support"


def test_classification_fallback_resilience(client: TestClient):
    """Test classification resilience for ambiguous query without failure."""
    response = client.post(
        "/api/tickets/classify",
        params={
            "subject": "Miscellaneous general query",
            "description": "Hello I have a quick inquiry.",
            "channel": "CHAT",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert "department" in data
    assert data["confidence"] > 0.0
