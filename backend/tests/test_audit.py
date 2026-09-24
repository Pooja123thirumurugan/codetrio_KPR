from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.ticket_event import TicketEvent


def test_audit_logs_persisted(db_session: Session):
    """Verify that critical actions create persistent audit log entries."""
    audit_entries = db_session.query(AuditLog).all()
    assert len(audit_entries) >= 1

    actions = [a.action for a in audit_entries]
    # Check for core audited events
    assert any("TICKET" in a or "ESCALATION" in a or "ROUTING" in a or "SIMULATION" in a for a in actions)


def test_ticket_events_logged(db_session: Session):
    """Verify ticket events track the lifecycle of tickets."""
    events = db_session.query(TicketEvent).all()
    assert len(events) >= 1
    event_types = [e.event_type for e in events]
    assert any(et in ["CREATED", "ROUTED", "ESCALATED", "AI_RESPONSE_GENERATED"] for et in event_types)
