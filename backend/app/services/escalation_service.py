from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.config import settings
from app.models.ticket import Ticket
from app.models.escalation import Escalation
from app.models.sla_prediction import SLAPrediction
from app.models.agent import Agent
from app.models.ticket_event import TicketEvent
from app.schemas.escalation import EscalationResponse
from app.services.audit_service import audit_service


class EscalationService:
    def check_and_escalate(
        self,
        db: Session,
        ticket: Ticket,
        force_trigger: Optional[str] = None,
        custom_reason: Optional[str] = None,
    ) -> Optional[Escalation]:
        """
        Evaluates pre-breach predictive escalation conditions.
        Crucial: Escalates BEFORE the SLA is actually breached!
        """
        from app.services.sla_service import sla_service

        sla_calc = sla_service.calculate_sla(ticket)

        # Fetch latest SLA prediction
        latest_pred = db.query(SLAPrediction).filter(
            SLAPrediction.ticket_id == ticket.id
        ).order_by(desc(SLAPrediction.created_at)).first()

        # If no prediction yet, calculate one now
        if not latest_pred:
            pred_resp = sla_service.predict_breach_risk(db, ticket)
            prob = pred_resp.breach_probability
            velocity = pred_resp.risk_velocity or 0.0
        else:
            prob = latest_pred.breach_probability
            velocity = latest_pred.risk_velocity or 0.0

        # Check existing active escalations to prevent duplicates
        existing_esc = db.query(Escalation).filter(
            Escalation.ticket_id == ticket.id,
            Escalation.status.in_(["PENDING_APPROVAL", "APPROVED"]),
        ).first()

        if existing_esc and not force_trigger:
            return existing_esc

        # Evaluate triggers
        trigger_fired = False
        trigger_type = "PRE_BREACH"
        machine_reason = "HIGH_BREACH_PROBABILITY"
        human_reason = ""
        level = "LEVEL_1"

        remaining_sla = sla_calc.remaining_minutes
        sla_buffer = settings.SLA_ESCALATION_BUFFER_MINUTES  # default 20 mins

        if force_trigger:
            trigger_fired = True
            trigger_type = force_trigger
            machine_reason = force_trigger
            human_reason = custom_reason or f"Manual or system forced escalation: {force_trigger}"
            level = "MANAGER"

        # 1. Primary Pre-Breach Risk + Buffer Trigger
        elif prob >= settings.SLA_BREACH_RISK_THRESHOLD and remaining_sla <= sla_buffer:
            trigger_fired = True
            trigger_type = "PRE_BREACH"
            machine_reason = "HIGH_BREACH_PROBABILITY"
            human_reason = (
                f"Ticket has an {prob*100:.0f}% predicted breach probability with only "
                f"{remaining_sla:.0f} minutes of SLA remaining (status: {sla_calc.status}, not yet breached)."
            )
            level = "LEVEL_2" if prob >= 0.85 else "LEVEL_1"

        # 2. Risk Velocity Acceleration Trigger
        elif velocity >= 0.20:
            trigger_fired = True
            trigger_type = "RISK_VELOCITY"
            machine_reason = "RAPID_RISK_INCREASE"
            human_reason = (
                f"SLA breach risk rapidly accelerated by +{velocity*100:.0f}% (current risk: {prob*100:.0f}%). "
                f"Pre-emptive intervention required before SLA deadline in {remaining_sla:.0f}m."
            )
            level = "LEVEL_2"

        # 3. Approaching deadline under high SLA consumption
        elif sla_calc.consumed_percent >= 90.0 and not sla_calc.is_breached:
            trigger_fired = True
            trigger_type = "SLA_BUFFER"
            machine_reason = "SLA_DEADLINE_NEAR"
            human_reason = (
                f"SLA consumption is at {sla_calc.consumed_percent:.1f}% with {remaining_sla:.0f} minutes left. "
                "Escalating prior to deadline."
            )
            level = "LEVEL_1"

        # 4. Agent Capacity Collapse (Assigned agent overloaded >95%)
        elif ticket.assigned_agent and ticket.assigned_agent.utilization >= 0.95:
            trigger_fired = True
            trigger_type = "CAPACITY_COLLAPSE"
            machine_reason = "AGENT_CAPACITY_COLLAPSE"
            human_reason = (
                f"Assigned agent {ticket.assigned_agent.name} is at {ticket.assigned_agent.utilization*100:.0f}% capacity. "
                "Risk of resolution bottleneck."
            )
            level = "LEVEL_1"

        if not trigger_fired:
            return None

        # Build suggested actions
        suggested_actions = [
            "Reassign to secondary tier specialist",
            "Increase agent priority queue weighting",
            "Notify customer of active priority investigation",
        ]
        if level in ["LEVEL_2", "MANAGER"]:
            suggested_actions.insert(0, "Alert Team Lead / On-call Supervisor immediately")

        # Create Escalation Record
        escalation = Escalation(
            ticket_id=ticket.id,
            level=level,
            trigger_type=trigger_type,
            machine_reason=machine_reason,
            human_reason=human_reason,
            risk_probability_at_trigger=prob,
            remaining_sla_minutes_at_trigger=remaining_sla,
            status="PENDING_APPROVAL",
            suggested_actions=suggested_actions,
        )
        db.add(escalation)

        # Update Ticket status to ESCALATED
        ticket.status = "ESCALATED"

        # Log Ticket Event
        event = TicketEvent(
            ticket_id=ticket.id,
            event_type="ESCALATED",
            actor="PREDICTIVE_ENGINE",
            details={
                "escalation_id": escalation.id,
                "trigger_type": trigger_type,
                "machine_reason": machine_reason,
                "risk_probability": prob,
                "remaining_sla_minutes": remaining_sla,
            },
        )
        db.add(event)
        db.commit()
        db.refresh(escalation)

        audit_service.log(
            db=db,
            action="ESCALATION_TRIGGERED",
            entity="escalation",
            entity_id=escalation.id,
            actor="PREDICTIVE_ENGINE",
            new_value={"level": level, "trigger_type": trigger_type, "risk": prob},
            reason=human_reason,
        )

        return escalation

    def approve_escalation(
        self,
        db: Session,
        escalation_id: str,
        approved_by: str = "Manager",
        notes: Optional[str] = None,
    ) -> Escalation:
        esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
        if not esc:
            raise ValueError("Escalation record not found")

        esc.status = "APPROVED"
        esc.approved_by = approved_by
        esc.approved_at = datetime.now(timezone.utc)
        if notes:
            esc.execution_notes = notes

        db.commit()
        db.refresh(esc)

        audit_service.log(
            db=db,
            action="ESCALATION_APPROVED",
            entity="escalation",
            entity_id=esc.id,
            actor=approved_by,
            reason=f"Approved by {approved_by}: {notes or 'No notes'}",
        )
        return esc

    def execute_escalation(
        self,
        db: Session,
        escalation_id: str,
        action_taken: str,
        target_agent_id: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Escalation:
        esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
        if not esc:
            raise ValueError("Escalation record not found")

        esc.status = "EXECUTED"
        esc.executed_at = datetime.now(timezone.utc)
        esc.execution_notes = f"Action: {action_taken}. {notes or ''}"

        # If reassigning to a new agent
        if target_agent_id and esc.ticket:
            target_agent = db.query(Agent).filter(Agent.id == target_agent_id).first()
            if target_agent:
                old_agent = esc.ticket.assigned_agent
                if old_agent and old_agent.active_ticket_count > 0:
                    old_agent.active_ticket_count -= 1
                    old_agent.utilization = round(old_agent.active_ticket_count / max(1, old_agent.max_capacity), 2)
                    if old_agent.status == "AT_CAPACITY" and old_agent.active_ticket_count < old_agent.max_capacity:
                        old_agent.status = "BUSY"

                esc.ticket.assigned_agent_id = target_agent.id
                target_agent.active_ticket_count += 1
                target_agent.utilization = round(target_agent.active_ticket_count / max(1, target_agent.max_capacity), 2)
                if target_agent.active_ticket_count >= target_agent.max_capacity:
                    target_agent.status = "AT_CAPACITY"

        db.commit()
        db.refresh(esc)

        audit_service.log(
            db=db,
            action="ESCALATION_EXECUTED",
            entity="escalation",
            entity_id=esc.id,
            actor="SYSTEM",
            reason=f"Executed action '{action_taken}'",
        )
        return esc


escalation_service = EscalationService()
