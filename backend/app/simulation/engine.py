import copy
from typing import Dict, Any, List
from app.simulation.state import SimulationSnapshot, SimulatedAgent


class SimulationEngine:
    """
    In-memory simulation engine for what-if operational modelling.
    Guarantees isolation: Absolutely NO production database records are mutated!
    """

    def run_simulation(
        self,
        initial: SimulationSnapshot,
        scenario: str,
        additional_tickets: int,
        agent_reduction: int,
        sla_change_percent: float,
    ) -> Dict[str, Any]:
        sim = copy.deepcopy(initial)

        # 1. Apply Agent Capacity Changes
        active_agents = [a for a in sim.agents if not a.is_offline]
        if agent_reduction > 0 and active_agents:
            # Mark agents offline
            num_to_offline = min(agent_reduction, len(active_agents))
            for i in range(num_to_offline):
                active_agents[i].is_offline = True
        elif agent_reduction < 0:
            # Add synthetic surge agents (e.g. recovery mode)
            for i in range(abs(agent_reduction)):
                sim.agents.append(
                    SimulatedAgent(
                        agent_id=f"sim-surge-agent-{i+1}",
                        name=f"Surge Specialist {i+1}",
                        max_capacity=5,
                        active_ticket_count=0,
                        utilization=0.0,
                        is_offline=False,
                    )
                )

        remaining_agents = [a for a in sim.agents if not a.is_offline]
        total_remaining_capacity = sum(a.max_capacity for a in remaining_agents) if remaining_agents else 1

        # 2. Apply Ticket Volume Changes
        sim.total_open_tickets = max(0, sim.total_open_tickets + additional_tickets)
        if scenario in ["CRITICAL_SURGE", "TICKET_SPIKE"]:
            sim.critical_tickets += int(additional_tickets * 0.4)

        # 3. Rebalance tickets across remaining agents
        total_open = sim.total_open_tickets
        if remaining_agents:
            tickets_per_agent = total_open / len(remaining_agents)
            for a in remaining_agents:
                a.active_ticket_count = int(tickets_per_agent)
                a.utilization = round(min(1.5, a.active_ticket_count / max(1, a.max_capacity)), 2)

        # Overall utilization
        total_active_load = sum(a.active_ticket_count for a in remaining_agents)
        sim.average_utilization = round(total_active_load / max(1.0, float(total_remaining_capacity)), 3)
        sim.active_agents = len(remaining_agents)
        sim.total_capacity = total_remaining_capacity

        # 4. Predict Risk and Breaches under new conditions
        # Baseline probability scales with utilization and queue depth
        util_factor = sim.average_utilization
        queue_factor = min(1.0, sim.total_open_tickets / 60.0)

        # SLA tightening effect
        sla_factor = max(0.0, -sla_change_percent / 100.0)

        sim_prob = min(0.98, max(0.05, (util_factor * 0.50) + (queue_factor * 0.35) + (sla_factor * 0.25)))
        sim.average_breach_probability = round(sim_prob, 3)

        # Estimate at-risk and predicted breaches
        sim.at_risk_count = int(sim.total_open_tickets * min(1.0, sim_prob * 1.2))
        sim.predicted_breaches = int(sim.total_open_tickets * (sim_prob ** 1.8))

        # 5. Generate Recommended Actions
        recommended_actions: List[str] = []
        if sim.average_utilization >= 0.85:
            recommended_actions.append(f"Deploy emergency surge staffing (+{int(sim.total_open_tickets * 0.2)} capacity needed)")
        if sim.total_open_tickets > initial.total_open_tickets * 1.5:
            recommended_actions.append("Implement automated self-service deflection for tier-1 repetitive inquiries")
        if sim.critical_tickets >= 10:
            recommended_actions.append("Establish Critical Incident Taskforce and reroute non-urgent queues")
        if sla_change_percent < -15.0:
            recommended_actions.append("Review contract SLAs with account management to align support expectations")
        if not recommended_actions:
            recommended_actions.append("Maintain standard proactive queue monitoring and standard agent shifts")

        # 6. Format Return Dictionaries
        queue_change = {
            "initial_queue_depth": initial.total_open_tickets,
            "simulated_queue_depth": sim.total_open_tickets,
            "delta_tickets": sim.total_open_tickets - initial.total_open_tickets,
            "critical_tickets_delta": sim.critical_tickets - initial.critical_tickets,
        }
        capacity_change = {
            "initial_utilization": initial.average_utilization,
            "simulated_utilization": sim.average_utilization,
            "delta_utilization": round(sim.average_utilization - initial.average_utilization, 3),
            "active_agents_change": sim.active_agents - initial.active_agents,
        }
        risk_change = {
            "initial_breach_probability": initial.average_breach_probability,
            "simulated_breach_probability": sim.average_breach_probability,
            "delta_probability": round(sim.average_breach_probability - initial.average_breach_probability, 3),
            "predicted_breaches": sim.predicted_breaches,
            "at_risk_tickets": sim.at_risk_count,
        }

        return {
            "initial_state": initial.model_dump(),
            "simulated_state": sim.model_dump(),
            "queue_change": queue_change,
            "capacity_change": capacity_change,
            "risk_change": risk_change,
            "predicted_breaches": sim.predicted_breaches,
            "at_risk_tickets_count": sim.at_risk_count,
            "recommended_actions": recommended_actions,
            "metrics": {
                "scenario": scenario,
                "capacity_pressure_index": round(sim.total_open_tickets / max(1, total_remaining_capacity), 2),
            },
        }


simulation_engine = SimulationEngine()
