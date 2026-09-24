import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.ticket import Ticket
from app.models.agent import Agent
from app.models.department import Department
from app.models.routing_decision import RoutingDecision
from app.models.ticket_event import TicketEvent
from app.schemas.routing import (
    RoutingDecisionResponse,
    RecommendedAgentSummary,
    AlternativeAgentSummary,
)
from app.services.audit_service import audit_service

logger = logging.getLogger("sla_guardian.services.routing")

# Component Weights (Configurable)
WEIGHT_SKILL = 0.30
WEIGHT_CAPACITY = 0.25
WEIGHT_SLA = 0.20
WEIGHT_QUEUE = 0.15
WEIGHT_HISTORY = 0.10


class RoutingService:
    def route_ticket(
        self,
        db: Session,
        ticket: Ticket,
        force_agent_id: Optional[str] = None,
        allow_overcapacity: bool = False,
    ) -> RoutingDecisionResponse:
        """
        Executes intelligent agent routing algorithm with capacity constraints and scoring.
        """
        # 1. Identify department
        dept_id = ticket.department_id
        if not dept_id and ticket.department_name:
            dept = db.query(Department).filter(Department.name.ilike(f"%{ticket.department_name}%")).first()
            if dept:
                dept_id = dept.id
                ticket.department_id = dept_id

        # 2. Identify required skills based on category / subject
        required_skills = self._infer_required_skills(ticket)

        # 3. Find candidate agents in department (or across system if none in dept)
        agent_query = db.query(Agent)
        if dept_id:
            agent_query = agent_query.filter(Agent.department_id == dept_id)
        candidates: List[Agent] = agent_query.all()

        if not candidates and dept_id:
            # Fallback across all departments if department has no configured agents
            candidates = db.query(Agent).all()

        # 4. Filter out OFFLINE agents
        active_candidates = [a for a in candidates if a.status != "OFFLINE" and bool(a.availability)]

        # 5. Filter out agents at full capacity (unless allow_overcapacity is forced)
        eligible_candidates = []
        at_capacity_candidates = []
        for agent in active_candidates:
            # Recompute dynamic utilization based on active tickets
            agent.utilization = round(agent.active_ticket_count / max(1, agent.max_capacity), 2)
            if agent.active_ticket_count >= agent.max_capacity or agent.status == "AT_CAPACITY":
                at_capacity_candidates.append(agent)
            else:
                eligible_candidates.append(agent)

        # Handle Forced Agent Override
        if force_agent_id:
            forced_agent = db.query(Agent).filter(Agent.id == force_agent_id).first()
            if forced_agent:
                return self._finalize_routing(
                    db=db,
                    ticket=ticket,
                    recommended_agent=forced_agent,
                    overall_score=0.99,
                    confidence=1.0,
                    skill_score=1.0,
                    cap_score=0.5,
                    sla_score=0.8,
                    queue_score=0.7,
                    hist_score=0.9,
                    reasons=["Manually routed or overridden by operator"],
                    alternatives=[],
                    status="OVERRIDDEN",
                )

        # 6. If EVERY suitable agent is at capacity
        if not eligible_candidates:
            logger.warning(f"No available agent found for Ticket {ticket.ticket_number} (all agents at capacity)")
            # Trigger escalation recommendation hook
            no_agent_decision = RoutingDecision(
                ticket_id=ticket.id,
                recommended_agent_id=None,
                overall_score=0.0,
                confidence=0.95,
                skill_match_score=0.0,
                capacity_score=0.0,
                sla_suitability_score=0.0,
                queue_load_score=0.0,
                historical_performance_score=0.0,
                reasons=[
                    "NO_AVAILABLE_AGENT: All qualified agents in department are at 100% capacity",
                    f"{len(at_capacity_candidates)} candidate agents currently at capacity",
                ],
                alternatives=[],
                status="NO_AVAILABLE_AGENT",
            )
            db.add(no_agent_decision)
            db.commit()
            db.refresh(no_agent_decision)

            audit_service.log(
                db=db,
                action="ROUTING_FAILED",
                entity="ticket",
                entity_id=ticket.id,
                actor="ROUTING_ENGINE",
                reason="All qualified agents at maximum capacity",
            )

            # Mark ticket as needing escalation
            from app.services.escalation_service import escalation_service
            escalation_service.check_and_escalate(
                db=db,
                ticket=ticket,
                force_trigger="NO_ELIGIBLE_AGENT",
                custom_reason="All department agents are at 100% capacity. No available agent for critical ticket.",
            )

            return RoutingDecisionResponse(
                id=no_agent_decision.id,
                ticket_id=ticket.id,
                recommended_agent=None,
                status="NO_AVAILABLE_AGENT",
                overall_score=0.0,
                confidence=0.95,
                skill_match_score=0.0,
                capacity_score=0.0,
                sla_suitability_score=0.0,
                queue_load_score=0.0,
                historical_performance_score=0.0,
                reasons=no_agent_decision.reasons,
                alternatives=[],
                created_at=no_agent_decision.created_at,
            )

        # 7. Score all eligible candidate agents
        scored_candidates: List[Tuple[Agent, float, float, float, float, float, float, List[str]]] = []
        for agent in eligible_candidates:
            scores = self._score_agent(agent, ticket, required_skills)
            scored_candidates.append(scores)

        # Sort descending by overall score
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        top_pick = scored_candidates[0]
        top_agent, overall_score, skill_sc, cap_sc, sla_sc, queue_sc, hist_sc, reasons = top_pick

        # Format alternatives
        alternatives: List[AlternativeAgentSummary] = []
        for alt_agent, alt_overall, a_skill, a_cap, a_sla, a_queue, a_hist, a_reasons in scored_candidates[1:4]:
            alternatives.append(
                AlternativeAgentSummary(
                    agent_id=alt_agent.id,
                    name=alt_agent.name,
                    score=round(alt_overall, 2),
                    skill_match_score=round(a_skill, 2),
                    capacity_score=round(a_cap, 2),
                    sla_suitability_score=round(a_sla, 2),
                    queue_load_score=round(a_queue, 2),
                    historical_performance_score=round(a_hist, 2),
                    reasons=a_reasons,
                )
            )

        return self._finalize_routing(
            db=db,
            ticket=ticket,
            recommended_agent=top_agent,
            overall_score=overall_score,
            confidence=0.91,
            skill_score=skill_sc,
            cap_score=cap_sc,
            sla_score=sla_sc,
            queue_score=queue_sc,
            hist_score=hist_sc,
            reasons=reasons,
            alternatives=alternatives,
            status="RECOMMENDED",
        )

    def _score_agent(
        self,
        agent: Agent,
        ticket: Ticket,
        required_skills: List[str],
    ) -> Tuple[Agent, float, float, float, float, float, float, List[str]]:
        reasons: List[str] = []

        # 1. Skill Match Score (30%)
        agent_skill_names = [s.name.lower() for s in agent.skills]
        if not required_skills:
            skill_score = 0.85
            reasons.append("General skills compatible")
        else:
            matches = [s for s in required_skills if s.lower() in agent_skill_names]
            skill_score = len(matches) / len(required_skills)
            if skill_score > 0:
                reasons.append(f"Possesses required skill: {', '.join(matches)}")
            else:
                skill_score = 0.20  # Low baseline if skill not listed

        # 2. Capacity Score (25%)
        # Lower utilization = higher capacity score
        util = agent.active_ticket_count / max(1, agent.max_capacity)
        capacity_score = max(0.0, 1.0 - util)
        if util <= 0.50:
            reasons.append(f"Low current utilization ({util*100:.0f}%, {agent.max_capacity - agent.active_ticket_count} slots open)")
        else:
            reasons.append(f"Moderate utilization ({util*100:.0f}%)")

        # 3. SLA Suitability Score (20%)
        # For critical tickets, prefer agents with low resolution time and low breach rate
        is_critical = ticket.priority in ["CRITICAL", "HIGH"]
        if is_critical:
            sla_suitability = max(0.1, 1.0 - (agent.average_resolution_minutes / 120.0))
            if agent.average_resolution_minutes <= 45.0:
                reasons.append("Fast average resolution time suitable for high SLA priority")
        else:
            sla_suitability = 0.85

        # 4. Queue / Load Score (15%)
        # Absolute number of active tickets
        queue_score = max(0.1, 1.0 - (agent.active_ticket_count / 10.0))

        # 5. Historical Performance (10%)
        # SLA breach rate (lower is better)
        hist_score = max(0.1, 1.0 - (agent.sla_breach_rate * 2.0))
        if agent.sla_breach_rate <= 0.05:
            reasons.append("Strong historical SLA compliance (<5% breaches)")

        # Overall Weighted Composite
        overall_score = round(
            (skill_score * WEIGHT_SKILL) +
            (capacity_score * WEIGHT_CAPACITY) +
            (sla_suitability * WEIGHT_SLA) +
            (queue_score * WEIGHT_QUEUE) +
            (hist_score * WEIGHT_HISTORY),
            3,
        )

        return (
            agent,
            overall_score,
            round(skill_score, 2),
            round(capacity_score, 2),
            round(sla_suitability, 2),
            round(queue_score, 2),
            round(hist_score, 2),
            reasons,
        )

    def _infer_required_skills(self, ticket: Ticket) -> List[str]:
        skills = []
        cat = (ticket.category or "").lower()
        subj = (ticket.subject or "").lower()
        if "payment" in cat or "payment" in subj:
            skills.extend(["Payments", "Refunds"])
        elif "auth" in cat or "login" in subj:
            skills.extend(["Authentication", "Account Support"])
        elif "tech" in cat or "bug" in subj or "error" in subj:
            skills.append("Technical Support")
        elif "bill" in cat or "invoice" in subj:
            skills.extend(["Billing", "Subscription"])
        elif "secur" in cat or "vulner" in subj:
            skills.append("Security & Compliance")
        return skills

    def _finalize_routing(
        self,
        db: Session,
        ticket: Ticket,
        recommended_agent: Agent,
        overall_score: float,
        confidence: float,
        skill_score: float,
        cap_score: float,
        sla_score: float,
        queue_score: float,
        hist_score: float,
        reasons: List[str],
        alternatives: List[AlternativeAgentSummary],
        status: str,
    ) -> RoutingDecisionResponse:
        # Assign agent to ticket and increment active count
        old_agent_id = ticket.assigned_agent_id
        ticket.assigned_agent_id = recommended_agent.id
        if ticket.status == "OPEN":
            ticket.status = "IN_PROGRESS"

        recommended_agent.active_ticket_count += 1
        recommended_agent.utilization = round(
            recommended_agent.active_ticket_count / max(1, recommended_agent.max_capacity), 2
        )
        if recommended_agent.active_ticket_count >= recommended_agent.max_capacity:
            recommended_agent.status = "AT_CAPACITY"
        else:
            recommended_agent.status = "BUSY"

        # Record Routing Decision in DB
        decision = RoutingDecision(
            ticket_id=ticket.id,
            recommended_agent_id=recommended_agent.id,
            overall_score=overall_score,
            confidence=confidence,
            skill_match_score=skill_score,
            capacity_score=cap_score,
            sla_suitability_score=sla_score,
            queue_load_score=queue_score,
            historical_performance_score=hist_score,
            reasons=reasons,
            alternatives=[alt.model_dump() for alt in alternatives],
            status=status,
        )
        db.add(decision)

        # Record TicketEvent
        event = TicketEvent(
            ticket_id=ticket.id,
            event_type="ROUTED",
            actor="ROUTING_ENGINE",
            details={
                "agent_id": recommended_agent.id,
                "agent_name": recommended_agent.name,
                "overall_score": overall_score,
                "reasons": reasons,
            },
        )
        db.add(event)
        db.commit()
        db.refresh(decision)

        audit_service.log(
            db=db,
            action="ROUTING_DECISION",
            entity="ticket",
            entity_id=ticket.id,
            actor="ROUTING_ENGINE",
            new_value={"agent_id": recommended_agent.id, "agent_name": recommended_agent.name, "score": overall_score},
            reason=f"Recommended {recommended_agent.name} (Score: {overall_score})",
        )

        agent_summary = RecommendedAgentSummary(
            id=recommended_agent.id,
            name=recommended_agent.name,
            department_name=recommended_agent.department.name if recommended_agent.department else None,
            utilization=recommended_agent.utilization,
            active_ticket_count=recommended_agent.active_ticket_count,
            max_capacity=recommended_agent.max_capacity,
            sla_breach_rate=recommended_agent.sla_breach_rate,
        )

        return RoutingDecisionResponse(
            id=decision.id,
            ticket_id=ticket.id,
            recommended_agent=agent_summary,
            status=status,
            overall_score=overall_score,
            confidence=confidence,
            skill_match_score=skill_score,
            capacity_score=cap_score,
            sla_suitability_score=sla_score,
            queue_load_score=queue_score,
            historical_performance_score=hist_score,
            reasons=reasons,
            alternatives=alternatives,
            created_at=decision.created_at,
        )


routing_service = RoutingService()
