from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.agent import Agent


def test_agent_capacity_endpoint(client: TestClient, db_session: Session):
    """Test GET /api/agents/{id}/capacity endpoint returns dynamic load calculations."""
    agent = db_session.query(Agent).filter(Agent.name == "Priya Sharma").first()
    response = client.get(f"/api/agents/{agent.id}/capacity")
    assert response.status_code == 200
    data = response.json()
    assert data["agent_id"] == agent.id
    assert data["max_capacity"] == agent.max_capacity
    assert data["active_ticket_count"] == agent.active_ticket_count
    assert data["available_capacity"] == (agent.max_capacity - agent.active_ticket_count)
    assert data["is_at_capacity"] is False
    assert data["is_available"] is True


def test_agent_at_capacity_flag(client: TestClient, db_session: Session):
    """Test that Marcus Chen is reported as is_at_capacity == True."""
    agent = db_session.query(Agent).filter(Agent.name == "Marcus Chen").first()
    response = client.get(f"/api/agents/{agent.id}/capacity")
    assert response.status_code == 200
    data = response.json()
    assert data["is_at_capacity"] is True
    assert data["available_capacity"] == 0
