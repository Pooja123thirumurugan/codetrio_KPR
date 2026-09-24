from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Test health check liveness probe and database connectivity."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "healthy"
    assert "SLA Guardian AI" in data["service"]


def test_system_status_endpoint(client: TestClient):
    """Test system subsystem status, ML models, and fallback readiness."""
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["application"] == "healthy"
    assert data["database"] == "healthy"
    assert data["sla_model"] in ["loaded", "fallback_predictor"]
    assert data["ai_provider"] in ["available", "fallback"]
    assert "websocket" in data
    assert data["websocket"]["status"] == "active"
