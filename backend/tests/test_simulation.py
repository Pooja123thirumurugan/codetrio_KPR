from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.ticket import Ticket


def test_ticket_spike_simulation_isolation(client: TestClient, db_session: Session):
    """
    Test running a 50-ticket spike simulation.
    CRITICAL: Verify simulation DOES NOT modify production ticket count!
    """
    initial_ticket_count = db_session.query(Ticket).count()

    payload = {
        "scenario": "TICKET_SPIKE",
        "additional_tickets": 50,
        "agent_reduction": 0,
        "sla_change_percent": 0.0,
    }
    response = client.post("/api/simulations/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["scenario"] == "TICKET_SPIKE"
    assert data["status"] == "COMPLETED"

    result = data["result"]
    assert result["queue_change"]["delta_tickets"] == 50
    assert result["predicted_breaches"] >= 1
    assert len(result["recommended_actions"]) >= 1

    # Verify production database ticket count is completely UNCHANGED
    final_ticket_count = db_session.query(Ticket).count()
    assert final_ticket_count == initial_ticket_count, "Simulation leaked into production tickets table!"


def test_agent_failure_simulation(client: TestClient):
    """Test what-if agent failure scenario with 3 agents offline."""
    payload = {
        "scenario": "AGENT_FAILURE",
        "additional_tickets": 0,
        "agent_reduction": 3,
        "sla_change_percent": 0.0,
    }
    response = client.post("/api/simulations/", json=payload)
    assert response.status_code == 201
    data = response.json()
    result = data["result"]
    assert result["capacity_change"]["active_agents_change"] == -3
    assert result["capacity_change"]["simulated_utilization"] > result["capacity_change"]["initial_utilization"]


def test_sla_tightening_simulation(client: TestClient):
    """Test what-if SLA tightening scenario with -30% SLA duration."""
    payload = {
        "scenario": "SLA_TIGHTENING",
        "additional_tickets": 10,
        "agent_reduction": 0,
        "sla_change_percent": -30.0,
    }
    response = client.post("/api/simulations/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["result"]["risk_change"]["predicted_breaches"] >= 0
