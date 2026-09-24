from datetime import datetime, timezone
from typing import Dict, Any, List
import numpy as np


PRIORITY_MAP = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
URGENCY_MAP = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
TIER_MAP = {"STANDARD": 1, "PREMIUM": 2, "ENTERPRISE": 3, "VIP": 4}
CHANNEL_MAP = {"EMAIL": 1, "WEB": 2, "CHAT": 3, "API": 4, "PHONE": 5}

FEATURE_COLUMNS = [
    "ticket_age_minutes",
    "sla_consumed_percent",
    "sla_remaining_minutes",
    "priority_num",
    "urgency_num",
    "customer_tier_num",
    "channel_num",
    "queue_depth",
    "department_queue_depth",
    "assigned_agent_load",
    "department_load",
    "agent_utilization",
    "average_resolution_time",
    "historical_breach_rate",
    "peak_hour_indicator",
    "ticket_complexity_proxy",
    "capacity_pressure",
]


def extract_features(
    ticket: Any,
    sla_info: Dict[str, Any],
    queue_state: Dict[str, Any],
    agent_info: Dict[str, Any] = None,
) -> Dict[str, float]:
    """
    Extracts a numeric feature dictionary from ticket, SLA info, and live queue/agent state.
    """
    agent_info = agent_info or {}

    # Age & SLA metrics
    ticket_age_minutes = float(sla_info.get("elapsed_minutes", 10.0))
    sla_consumed_percent = float(sla_info.get("consumed_percent", 20.0))
    sla_remaining_minutes = max(0.0, float(sla_info.get("remaining_minutes", 60.0)))

    # Priority & Urgency
    p_str = getattr(ticket, "priority", "MEDIUM") or "MEDIUM"
    u_str = getattr(ticket, "urgency", "MEDIUM") or "MEDIUM"
    priority_num = float(PRIORITY_MAP.get(p_str.upper(), 2))
    urgency_num = float(URGENCY_MAP.get(u_str.upper(), 2))

    # Customer tier
    customer = getattr(ticket, "customer", None)
    tier_str = getattr(customer, "tier", "STANDARD") if customer else "STANDARD"
    customer_tier_num = float(TIER_MAP.get((tier_str or "STANDARD").upper(), 1))

    # Channel
    channel_str = getattr(ticket, "channel", "WEB") or "WEB"
    channel_num = float(CHANNEL_MAP.get(channel_str.upper(), 2))

    # Queue state
    queue_depth = float(queue_state.get("total_open_tickets", 10))
    department_queue_depth = float(queue_state.get("department_queue_depth", 5))
    department_load = float(queue_state.get("department_load", 10))
    capacity_pressure = float(queue_state.get("capacity_pressure", 0.5))

    # Agent info
    assigned_agent_load = float(agent_info.get("active_ticket_count", 2))
    agent_utilization = float(agent_info.get("utilization", 0.40))
    avg_res_time = float(agent_info.get("average_resolution_minutes", 45.0))
    hist_breach_rate = float(agent_info.get("sla_breach_rate", 0.05))

    # Peak hour indicator
    now = datetime.now(timezone.utc)
    hour = now.hour
    peak_hour = 1.0 if 9 <= hour <= 18 else 0.0

    # Complexity proxy based on subject and description length
    desc = getattr(ticket, "description", "") or ""
    subj = getattr(ticket, "subject", "") or ""
    text_len = len(desc) + len(subj)
    complexity = min(5.0, max(1.0, text_len / 200.0))

    return {
        "ticket_age_minutes": ticket_age_minutes,
        "sla_consumed_percent": sla_consumed_percent,
        "sla_remaining_minutes": sla_remaining_minutes,
        "priority_num": priority_num,
        "urgency_num": urgency_num,
        "customer_tier_num": customer_tier_num,
        "channel_num": channel_num,
        "queue_depth": queue_depth,
        "department_queue_depth": department_queue_depth,
        "assigned_agent_load": assigned_agent_load,
        "department_load": department_load,
        "agent_utilization": agent_utilization,
        "average_resolution_time": avg_res_time,
        "historical_breach_rate": hist_breach_rate,
        "peak_hour_indicator": peak_hour,
        "ticket_complexity_proxy": complexity,
        "capacity_pressure": capacity_pressure,
    }


def to_vector(features: Dict[str, float]) -> np.ndarray:
    """Converts feature dict to 2D numpy array for ML model prediction."""
    return np.array([[features[col] for col in FEATURE_COLUMNS]], dtype=np.float32)
