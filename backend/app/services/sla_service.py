from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.ticket import Ticket
from app.models.sla_policy import SLAPolicy
from app.models.sla_prediction import SLAPrediction
from app.models.agent import Agent
from app.models.customer import Customer
from app.ml.feature_engineering import extract_features
from app.ml.sla_predictor import SLABreachPredictor
from app.schemas.sla import SLACalculationResult, SLAPredictionResponse
from app.services.audit_service import audit_service


class SLAService:
    def __init__(self):
        self.predictor = SLABreachPredictor()

    def select_policy(
        self,
        db: Session,
        priority: str,
        customer_tier: str = "STANDARD",
    ) -> Optional[SLAPolicy]:
        """
        Retrieves the appropriate SLA policy for given priority and tier.
        Falls back to default priority policy if tier-specific is not found.
        """
        priority_clean = (priority or "MEDIUM").upper()
        tier_clean = (customer_tier or "STANDARD").upper()

        # 1. Exact match priority + tier
        policy = db.query(SLAPolicy).filter(
            SLAPolicy.priority == priority_clean,
            SLAPolicy.customer_tier == tier_clean,
            SLAPolicy.is_active == True,
        ).first()

        # 2. Match priority + STANDARD tier fallback
        if not policy:
            policy = db.query(SLAPolicy).filter(
                SLAPolicy.priority == priority_clean,
                SLAPolicy.is_active == True,
            ).first()

        # 3. Default fallback
        if not policy:
            policy = db.query(SLAPolicy).first()

        return policy

    def calculate_sla(
        self,
        ticket: Ticket,
        policy: Optional[SLAPolicy] = None,
    ) -> SLACalculationResult:
        """
        Calculates SLA deadline, consumed %, remaining time, and status.
        Status: SAFE, WARNING, AT_RISK, BREACHED.
        """
        policy = policy or ticket.sla_policy

        # Fallback values if no policy in database
        res_minutes = policy.resolution_minutes if policy else 240
        warn_pct = policy.warning_threshold_percent if policy else 75.0
        escl_pct = policy.escalation_threshold_percent if policy else 90.0
        policy_name = policy.name if policy else "DEFAULT_MEDIUM_SLA"
        policy_id = policy.id if policy else None

        created_at = ticket.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        deadline = created_at + timedelta(minutes=res_minutes)

        elapsed_seconds = max(0.0, (now - created_at).total_seconds())
        elapsed_minutes = round(elapsed_seconds / 60.0, 1)

        remaining_seconds = (deadline - now).total_seconds()
        remaining_minutes = round(max(0.0, remaining_seconds / 60.0), 1)

        consumed_percent = round((elapsed_minutes / max(1.0, float(res_minutes))) * 100.0, 1)

        # Status determination:
        # AT_RISK occurs BEFORE BREACHED!
        is_breached = (now >= deadline) or (consumed_percent >= 100.0)
        is_at_risk = not is_breached and (consumed_percent >= escl_pct or remaining_minutes <= 25.0)

        if is_breached:
            status = "BREACHED"
        elif is_at_risk:
            status = "AT_RISK"
        elif consumed_percent >= warn_pct:
            status = "WARNING"
        else:
            status = "SAFE"

        return SLACalculationResult(
            ticket_id=ticket.id,
            ticket_number=ticket.ticket_number,
            sla_policy_id=policy_id,
            sla_policy_name=policy_name,
            priority=ticket.priority,
            created_at=created_at,
            deadline=deadline,
            elapsed_minutes=elapsed_minutes,
            remaining_minutes=remaining_minutes,
            consumed_percent=consumed_percent,
            status=status,
            is_breached=is_breached,
            is_at_risk=is_at_risk,
            warning_threshold_percent=warn_pct,
            escalation_threshold_percent=escl_pct,
        )

    def get_live_queue_state(
        self,
        db: Session,
        department_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Gathers live operational queue depth, capacity, and load metrics.
        """
        active_statuses = ["OPEN", "IN_PROGRESS", "PENDING", "ESCALATED"]

        total_open = db.query(Ticket).filter(Ticket.status.in_(active_statuses)).count()
        critical_count = db.query(Ticket).filter(
            Ticket.status.in_(active_statuses),
            Ticket.priority == "CRITICAL",
        ).count()

        dept_query = db.query(Ticket).filter(Ticket.status.in_(active_statuses))
        if department_id:
            dept_query = dept_query.filter(Ticket.department_id == department_id)
        dept_queue_depth = dept_query.count()

        # Agents capacity
        agents_query = db.query(Agent).filter(Agent.status != "OFFLINE")
        if department_id:
            agents_query = agents_query.filter(Agent.department_id == department_id)
        agents = agents_query.all()

        total_max_cap = sum(a.max_capacity for a in agents) if agents else 1
        total_active_load = sum(a.active_ticket_count for a in agents) if agents else 0
        avg_utilization = total_active_load / max(1.0, float(total_max_cap))
        available_cap = max(0, total_max_cap - total_active_load)

        capacity_pressure = dept_queue_depth / max(1.0, float(available_cap if available_cap > 0 else 0.5))

        return {
            "total_open_tickets": total_open,
            "critical_queue_depth": critical_count,
            "department_queue_depth": dept_queue_depth,
            "department_load": dept_queue_depth,
            "available_capacity": available_cap,
            "capacity_pressure": min(5.0, capacity_pressure),
            "average_utilization": round(avg_utilization, 3),
        }

    def predict_breach_risk(
        self,
        db: Session,
        ticket: Ticket,
        current_queue_depth: Optional[int] = None,
        department_queue_depth: Optional[int] = None,
        agent_utilization: Optional[float] = None,
    ) -> SLAPredictionResponse:
        """
        Evaluates SLA breach risk probability, risk level, contributing factors,
        and risk velocity using live or overridden queue states.
        """
        sla_calc = self.calculate_sla(ticket)

        # 1. Fetch live queue state
        live_queue = self.get_live_queue_state(db, ticket.department_id)

        # Apply simulation or parameter overrides if provided
        if current_queue_depth is not None:
            live_queue["total_open_tickets"] = current_queue_depth
        if department_queue_depth is not None:
            live_queue["department_queue_depth"] = department_queue_depth
        if agent_utilization is not None:
            live_queue["average_utilization"] = agent_utilization

        # 2. Assigned agent info
        agent_info = {}
        if ticket.assigned_agent:
            agent_info = {
                "active_ticket_count": ticket.assigned_agent.active_ticket_count,
                "utilization": agent_utilization if agent_utilization is not None else ticket.assigned_agent.utilization,
                "average_resolution_minutes": ticket.assigned_agent.average_resolution_minutes,
                "sla_breach_rate": ticket.assigned_agent.sla_breach_rate,
            }
        else:
            agent_info = {
                "active_ticket_count": 0,
                "utilization": agent_utilization if agent_utilization is not None else live_queue["average_utilization"],
                "average_resolution_minutes": 45.0,
                "sla_breach_rate": 0.05,
            }

        # 3. Extract feature vector
        sla_dict = {
            "elapsed_minutes": sla_calc.elapsed_minutes,
            "consumed_percent": sla_calc.consumed_percent,
            "remaining_minutes": sla_calc.remaining_minutes,
        }
        features = extract_features(ticket, sla_dict, live_queue, agent_info)

        # 4. Predict risk probability and factors
        breach_prob, risk_level, confidence, factors, is_fallback = self.predictor.predict(features)

        # 5. Calculate Risk Velocity (change from previous prediction)
        prev_pred = db.query(SLAPrediction).filter(
            SLAPrediction.ticket_id == ticket.id
        ).order_by(desc(SLAPrediction.created_at)).first()

        risk_velocity = 0.0
        if prev_pred:
            risk_velocity = round(breach_prob - prev_pred.breach_probability, 3)
            if risk_velocity >= 0.15:
                factors.insert(0, f"Rapid risk velocity (+{risk_velocity*100:.1f}% risk acceleration)")

        # 6. Save prediction record to database
        db_prediction = SLAPrediction(
            ticket_id=ticket.id,
            breach_probability=breach_prob,
            risk_level=risk_level,
            predicted_breach_time_minutes=sla_calc.remaining_minutes,
            confidence=confidence,
            queue_depth_at_prediction=int(live_queue["total_open_tickets"]),
            department_queue_depth=int(live_queue["department_queue_depth"]),
            agent_utilization_at_prediction=float(agent_info["utilization"]),
            sla_consumed_percent=sla_calc.consumed_percent,
            remaining_sla_minutes=sla_calc.remaining_minutes,
            risk_velocity=risk_velocity,
            contributing_factors=factors,
            feature_snapshot=features,
            model_version="xgb-sla-v1.0" if not is_fallback else "deterministic-rules-v1.0",
            is_fallback=is_fallback,
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)

        audit_service.log(
            db=db,
            action="RISK_PREDICTED",
            entity="ticket",
            entity_id=ticket.id,
            actor="SLA_ENGINE",
            new_value={"breach_probability": breach_prob, "risk_level": risk_level},
            reason=f"Risk: {breach_prob:.2f} ({risk_level}) under queue depth {live_queue['total_open_tickets']}",
        )

        return SLAPredictionResponse(
            id=db_prediction.id,
            ticket_id=ticket.id,
            ticket_number=ticket.ticket_number,
            breach_probability=breach_prob,
            risk_level=risk_level,
            predicted_breach_time_minutes=sla_calc.remaining_minutes,
            confidence=confidence,
            queue_depth_at_prediction=db_prediction.queue_depth_at_prediction,
            agent_utilization_at_prediction=db_prediction.agent_utilization_at_prediction,
            sla_consumed_percent=sla_calc.consumed_percent,
            remaining_sla_minutes=sla_calc.remaining_minutes,
            risk_velocity=risk_velocity,
            contributing_factors=factors,
            model_version=db_prediction.model_version,
            is_fallback=is_fallback,
            created_at=db_prediction.created_at,
        )

    # Method alias for convenience
    predict_sla_breach = predict_breach_risk


sla_service = SLAService()
