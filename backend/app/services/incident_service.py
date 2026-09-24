import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.incident_action import IncidentAction
from app.models.ticket import Ticket
from app.models.agent import Agent
from app.models.department import Department
from app.models.sla_prediction import SLAPrediction
from app.services.audit_service import audit_service


class IncidentService:
    def scan_for_incidents(self, db: Session, department_id: Optional[str] = None) -> List[Incident]:
        """
        Scans operational state and creates incidents if thresholds are breached.
        """
        detected_incidents: List[Incident] = []
        active_statuses = ["OPEN", "IN_PROGRESS", "PENDING", "ESCALATED"]

        # 1. Check Critical Spike
        critical_tickets = db.query(Ticket).filter(
            Ticket.status.in_(active_statuses),
            Ticket.priority == "CRITICAL",
        ).all()

        if len(critical_tickets) >= 5:
            inc = self._create_or_get_active_incident(
                db=db,
                trigger="CRITICAL_SPIKE",
                title=f"Critical Ticket Spike: {len(critical_tickets)} active critical issues",
                severity="CRITICAL",
                department_id=department_id,
                current_state={"critical_ticket_count": len(critical_tickets)},
                actions=[
                    ("PRIORITIZE_CRITICAL", "Hold low-priority ticket processing and fast-track critical items", 1),
                    ("ESCALATE_HIGH_RISK", "Notify incident commander and escalate to Senior Support Leads", 2),
                    ("ACTIVATE_AGENTS", "Recall off-duty tier-2 on-call engineers", 3),
                ],
            )
            if inc:
                detected_incidents.append(inc)

        # 2. Check Queue Overload & Capacity Collapse
        agents = db.query(Agent).filter(Agent.status != "OFFLINE")
        if department_id:
            agents = agents.filter(Agent.department_id == department_id)
        agents_list = agents.all()

        total_cap = sum(a.max_capacity for a in agents_list) if agents_list else 1
        active_load = sum(a.active_ticket_count for a in agents_list) if agents_list else 0
        overall_utilization = active_load / max(1.0, float(total_cap))

        total_queue = db.query(Ticket).filter(Ticket.status.in_(active_statuses)).count()

        if overall_utilization >= 0.90 or total_queue >= 30:
            inc = self._create_or_get_active_incident(
                db=db,
                trigger="CAPACITY_COLLAPSE" if overall_utilization >= 0.90 else "QUEUE_OVERLOAD",
                title=f"Department Capacity Collapse: Utilization at {overall_utilization*100:.0f}%",
                severity="HIGH",
                department_id=department_id,
                current_state={"utilization": overall_utilization, "queue_depth": total_queue},
                actions=[
                    ("INCREASE_CAPACITY", "Increase max active ticket allowance for senior agents", 1),
                    ("ROUTE_OVERFLOW", "Enable cross-department overflow routing for tier-1 tickets", 2),
                    ("REASSIGN_TICKETS", "Rebalance tickets from overloaded agents to available staff", 3),
                ],
            )
            if inc:
                detected_incidents.append(inc)

        return detected_incidents

    def _create_or_get_active_incident(
        self,
        db: Session,
        trigger: str,
        title: str,
        severity: str,
        department_id: Optional[str],
        current_state: Dict[str, Any],
        actions: List[tuple],
    ) -> Optional[Incident]:
        # Avoid creating duplicate incidents with same trigger in DETECTED state
        existing = db.query(Incident).filter(
            Incident.trigger == trigger,
            Incident.status.in_(["DETECTED", "INVESTIGATING"]),
        ).first()

        if existing:
            return existing

        inc_num = f"INC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
        incident = Incident(
            incident_number=inc_num,
            title=title,
            severity=severity,
            department_id=department_id,
            trigger=trigger,
            status="DETECTED",
            current_state=current_state,
        )
        db.add(incident)
        db.flush()

        # Add recommended actions
        for act_type, desc, priority in actions:
            action_record = IncidentAction(
                incident_id=incident.id,
                action_type=act_type,
                description=desc,
                priority=priority,
                status="RECOMMENDED",
            )
            db.add(action_record)

        db.commit()
        db.refresh(incident)

        audit_service.log(
            db=db,
            action="INCIDENT_DETECTED",
            entity="incident",
            entity_id=incident.id,
            actor="INCIDENT_ENGINE",
            new_value={"severity": severity, "trigger": trigger},
            reason=title,
        )
        return incident

    def approve_action(self, db: Session, action_id: str, approved_by: str) -> IncidentAction:
        action = db.query(IncidentAction).filter(IncidentAction.id == action_id).first()
        if not action:
            raise ValueError("Incident action not found")
        action.status = "APPROVED"
        action.approved_by = approved_by
        db.commit()
        db.refresh(action)
        return action

    def execute_action(self, db: Session, action_id: str, notes: Optional[str] = None) -> IncidentAction:
        action = db.query(IncidentAction).filter(IncidentAction.id == action_id).first()
        if not action:
            raise ValueError("Incident action not found")
        action.status = "EXECUTED"
        action.executed_at = datetime.now(timezone.utc)
        action.result_summary = notes or "Action executed successfully under supervisor oversight."
        db.commit()
        db.refresh(action)
        return action


incident_service = IncidentService()
