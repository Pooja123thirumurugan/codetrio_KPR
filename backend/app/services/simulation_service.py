from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.simulation import Simulation
from app.models.simulation_result import SimulationResult
from app.models.ticket import Ticket
from app.models.agent import Agent
from app.simulation.state import SimulationSnapshot, SimulatedAgent
from app.simulation.engine import simulation_engine
from app.schemas.simulation import SimulationRequest, SimulationResponse, SimulationResultResponse
from app.services.audit_service import audit_service


class SimulationService:
    def create_and_run_simulation(
        self,
        db: Session,
        req: SimulationRequest,
    ) -> SimulationResponse:
        """
        Takes current production state snapshot, runs isolated simulation in-memory,
        persists simulation audit records, but does NOT modify production tickets or agents!
        """
        # 1. Capture snapshot of live operational state
        active_statuses = ["OPEN", "IN_PROGRESS", "PENDING", "ESCALATED"]
        tickets_q = db.query(Ticket).filter(Ticket.status.in_(active_statuses))
        if req.department_id:
            tickets_q = tickets_q.filter(Ticket.department_id == req.department_id)
        open_tickets = tickets_q.all()

        agents_q = db.query(Agent).filter(Agent.status != "OFFLINE")
        if req.department_id:
            agents_q = agents_q.filter(Agent.department_id == req.department_id)
        agents = agents_q.all()

        total_open = len(open_tickets)
        critical_count = sum(1 for t in open_tickets if t.priority == "CRITICAL")
        total_cap = sum(a.max_capacity for a in agents) if agents else 1
        active_load = sum(a.active_ticket_count for a in agents) if agents else 0
        current_util = active_load / max(1.0, float(total_cap))

        simulated_agents = [
            SimulatedAgent(
                agent_id=a.id,
                name=a.name,
                max_capacity=a.max_capacity,
                active_ticket_count=a.active_ticket_count,
                utilization=a.utilization,
                is_offline=False,
            )
            for a in agents
        ]

        initial_snapshot = SimulationSnapshot(
            total_open_tickets=total_open,
            critical_tickets=critical_count,
            active_agents=len(agents),
            total_capacity=total_cap,
            average_utilization=round(current_util, 3),
            average_breach_probability=0.28,
            at_risk_count=int(total_open * 0.20),
            predicted_breaches=int(total_open * 0.08),
            agents=simulated_agents,
        )

        # 2. Record Simulation Entity in Database
        simulation = Simulation(
            scenario=req.scenario,
            parameters=req.model_dump(),
            status="RUNNING",
        )
        db.add(simulation)
        db.flush()

        # 3. Execute in-memory simulation
        outcome = simulation_engine.run_simulation(
            initial=initial_snapshot,
            scenario=req.scenario,
            additional_tickets=req.additional_tickets,
            agent_reduction=req.agent_reduction,
            sla_change_percent=req.sla_change_percent,
        )

        # 4. Save simulation result record
        sim_result = SimulationResult(
            simulation_id=simulation.id,
            initial_state=outcome["initial_state"],
            simulated_state=outcome["simulated_state"],
            queue_change=outcome["queue_change"],
            capacity_change=outcome["capacity_change"],
            risk_change=outcome["risk_change"],
            predicted_breaches=outcome["predicted_breaches"],
            at_risk_tickets_count=outcome["at_risk_tickets_count"],
            recommended_actions=outcome["recommended_actions"],
            metrics=outcome["metrics"],
        )
        db.add(sim_result)

        simulation.status = "COMPLETED"
        simulation.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(simulation)

        audit_service.log(
            db=db,
            action="SIMULATION_STARTED",
            entity="simulation",
            entity_id=simulation.id,
            actor="SIMULATION_ENGINE",
            new_value={"scenario": req.scenario, "breaches": outcome["predicted_breaches"]},
            reason=f"Executed simulation scenario {req.scenario}",
        )

        result_resp = SimulationResultResponse(
            id=sim_result.id,
            simulation_id=simulation.id,
            initial_state=sim_result.initial_state,
            simulated_state=sim_result.simulated_state,
            queue_change=sim_result.queue_change,
            capacity_change=sim_result.capacity_change,
            risk_change=sim_result.risk_change,
            predicted_breaches=sim_result.predicted_breaches,
            at_risk_tickets_count=sim_result.at_risk_tickets_count,
            recommended_actions=sim_result.recommended_actions,
            metrics=sim_result.metrics,
            created_at=sim_result.created_at,
        )

        return SimulationResponse(
            id=simulation.id,
            scenario=simulation.scenario,
            parameters=simulation.parameters,
            status=simulation.status,
            created_at=simulation.created_at,
            completed_at=simulation.completed_at,
            result=result_resp,
        )


simulation_service = SimulationService()
