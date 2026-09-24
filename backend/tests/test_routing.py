from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.department import Department
from app.models.ticket import Ticket
from app.services.routing_service import routing_service


def test_routing_skill_match_and_recommendation(client: TestClient):
    """Test routing recommendation selects qualified agent with matching skills."""
    # Route TCK-1048 (Payments category)
    response = client.post("/api/tickets/TCK-1048/route")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["RECOMMENDED", "ACCEPTED"]
    assert data["recommended_agent"] is not None
    # Priya Sharma has Payments & Refunds skills with low utilization
    assert data["recommended_agent"]["name"] in ["Priya Sharma", "Elena Rostova"]
    assert data["skill_match_score"] >= 0.80
    assert len(data["reasons"]) >= 1
    assert "alternatives" in data


def test_routing_excludes_offline_agents(db_session: Session):
    """Verify OFFLINE agents are never selected by the routing engine."""
    kenji = db_session.query(Agent).filter(Agent.name == "Kenji Sato").first()
    assert kenji.status == "OFFLINE"

    ticket = db_session.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
    decision = routing_service.route_ticket(db_session, ticket)
    assert decision.recommended_agent.id != kenji.id


def test_routing_respects_capacity_constraints(client: TestClient, db_session: Session):
    """
    Verify agent at 100% capacity (Marcus Chen) is NOT selected for new assignments.
    """
    marcus = db_session.query(Agent).filter(Agent.name == "Marcus Chen").first()
    assert marcus.active_ticket_count >= marcus.max_capacity
    assert marcus.status == "AT_CAPACITY"

    ticket = db_session.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
    decision = routing_service.route_ticket(db_session, ticket)
    assert decision.recommended_agent.id != marcus.id


def test_no_available_agent_triggers_escalation(db_session: Session):
    """
    Verify when ALL qualified department agents are at 100% capacity,
    system returns NO_AVAILABLE_AGENT and triggers escalation recommendation!
    """
    dept = db_session.query(Department).filter(Department.name == "Payments").first()
    dept_agents = db_session.query(Agent).filter(Agent.department_id == dept.id).all()

    # Temporarily set all payment agents to maximum capacity
    original_loads = []
    for a in dept_agents:
        original_loads.append((a, a.active_ticket_count, a.status))
        a.active_ticket_count = a.max_capacity
        a.status = "AT_CAPACITY"
    db_session.commit()

    try:
        ticket = db_session.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
        decision = routing_service.route_ticket(db_session, ticket)
        assert decision.status == "NO_AVAILABLE_AGENT"
        assert decision.recommended_agent is None
        assert any("NO_AVAILABLE_AGENT" in r for r in decision.reasons)
    finally:
        # Restore agent loads
        for a, load, stat in original_loads:
            a.active_ticket_count = load
            a.status = stat
        db_session.commit()
