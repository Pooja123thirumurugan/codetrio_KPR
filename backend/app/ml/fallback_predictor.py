from typing import Dict, Any, List, Tuple
import math


class FallbackSLAPredictor:
    """
    Deterministic SLA breach risk predictor used when XGBoost model artifact is not loaded
    or as a baseline comparison.
    Calculates risk probability as a weighted composite of:
    - SLA Consumption & Time Pressure (35%)
    - Live Queue & Capacity Pressure (30%)
    - Agent Load & Historical Reliability (20%)
    - Priority & Ticket Complexity (15%)
    """

    def predict(self, features: Dict[str, float]) -> Tuple[float, str, float, List[str]]:
        """
        Returns:
            breach_probability: float between 0.0 and 1.0
            risk_level: 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'
            confidence: float (0.85 - 0.95)
            factors: List of human-readable contributing factor strings
        """
        factors: List[str] = []

        # 1. SLA Consumption & Time Component (0.0 to 1.0)
        sla_consumed = features.get("sla_consumed_percent", 0.0)
        remaining_minutes = features.get("sla_remaining_minutes", 60.0)

        # Non-linear acceleration as consumption passes 75% and 90%
        if sla_consumed >= 100.0:
            sla_risk_comp = 1.0
            factors.append("SLA deadline has been reached (100%+ consumed)")
        elif sla_consumed >= 80.0:
            sla_risk_comp = 0.70 + (sla_consumed - 80.0) * 0.015
            factors.append(f"High SLA consumption ({sla_consumed:.1f}%)")
        elif sla_consumed >= 50.0:
            sla_risk_comp = 0.35 + (sla_consumed - 50.0) * 0.01
        else:
            sla_risk_comp = max(0.05, sla_consumed * 0.007)

        if remaining_minutes <= 20.0:
            factors.append(f"SLA remaining below 20 minutes ({remaining_minutes:.0f}m left)")

        # 2. Live Queue & Capacity Pressure Component (0.0 to 1.0)
        queue_depth = features.get("queue_depth", 10.0)
        dept_queue = features.get("department_queue_depth", 5.0)
        capacity_pressure = features.get("capacity_pressure", 0.5)

        # Scale queue depth: 0-10 is low, 10-25 medium, 25-50 high
        # At queue_depth=5, queue_comp ~ 0.15; at queue_depth=35, queue_comp ~ 0.85
        queue_comp = min(1.0, (queue_depth / 40.0) * 0.6 + (dept_queue / 25.0) * 0.4)
        if queue_depth >= 20.0 or dept_queue >= 15.0:
            factors.append(f"High department queue depth ({int(dept_queue)} pending tickets)")

        # 3. Agent Utilization & Load Component (0.0 to 1.0)
        utilization = features.get("agent_utilization", 0.40)
        hist_breach_rate = features.get("historical_breach_rate", 0.05)
        avg_res_time = features.get("average_resolution_time", 45.0)

        # At util=0.40, util_comp ~ 0.35; at util=0.92, util_comp ~ 0.95
        if utilization >= 0.85:
            util_comp = 0.85 + (utilization - 0.85) * 1.0
            factors.append(f"Agent utilization above 85% ({utilization * 100:.1f}%)")
        elif utilization >= 0.65:
            util_comp = 0.55 + (utilization - 0.65) * 1.2
        else:
            util_comp = max(0.1, utilization * 0.75)

        # Agent resolution time vs remaining time
        if remaining_minutes < avg_res_time and remaining_minutes > 0:
            factors.append(f"Agent avg resolution time ({avg_res_time:.0f}m) exceeds remaining SLA ({remaining_minutes:.0f}m)")

        # 4. Priority & Urgency Component (0.0 to 1.0)
        priority_num = features.get("priority_num", 2.0)
        urgency_num = features.get("urgency_num", 2.0)
        p_comp = ((priority_num - 1.0) / 3.0) * 0.6 + ((urgency_num - 1.0) / 3.0) * 0.4
        if priority_num >= 4.0:
            factors.append("Critical priority ticket with expedited SLA deadline")

        # Composite Probability Calculation
        # Weights: SLA=35%, Queue=30%, Utilization/Agent=20%, Priority=15%
        raw_prob = (
            sla_risk_comp * 0.35 +
            queue_comp * 0.30 +
            util_comp * 0.20 +
            p_comp * 0.15
        )

        # Boost if remaining time is critically tight relative to resolution time or high queue stress
        if (remaining_minutes <= 20.0 and priority_num >= 3.0 and queue_depth >= 20.0 and utilization >= 0.80) or (queue_depth >= 25.0 and utilization >= 0.80 and sla_consumed >= 40.0):
            raw_prob = min(0.98, max(0.82, raw_prob * 1.35))
        elif queue_depth >= 25.0 and utilization >= 0.80 and sla_consumed >= 60.0:
            raw_prob = min(0.98, raw_prob * 1.22)

        # Clamp between 0.02 and 0.99
        breach_probability = round(min(0.99, max(0.02, raw_prob)), 3)

        # Map to Risk Level
        if breach_probability >= 0.75:
            risk_level = "CRITICAL"
        elif breach_probability >= 0.50:
            risk_level = "HIGH"
        elif breach_probability >= 0.25:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        confidence = 0.88

        # Fallback if no specific factors generated
        if not factors:
            factors.append(f"Calculated from current queue depth ({int(queue_depth)}) and SLA consumption ({sla_consumed:.1f}%)")

        return breach_probability, risk_level, confidence, factors
