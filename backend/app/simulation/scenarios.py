from typing import Dict, Any


SCENARIO_CONFIGS: Dict[str, Dict[str, Any]] = {
    "NORMAL_LOAD": {
        "description": "Baseline operational conditions with standard arrival rates",
        "default_additional_tickets": 0,
        "default_agent_reduction": 0,
        "default_sla_change_percent": 0.0,
    },
    "TICKET_SPIKE": {
        "description": "Sudden arrival spike of 50 new customer tickets",
        "default_additional_tickets": 50,
        "default_agent_reduction": 0,
        "default_sla_change_percent": 0.0,
    },
    "AGENT_FAILURE": {
        "description": "3 support agents go offline unexpectedly during shift",
        "default_additional_tickets": 0,
        "default_agent_reduction": 3,
        "default_sla_change_percent": 0.0,
    },
    "QUEUE_OVERLOAD": {
        "description": "High ticket volume combined with reduced agent capacity",
        "default_additional_tickets": 60,
        "default_agent_reduction": 2,
        "default_sla_change_percent": 0.0,
    },
    "SLA_TIGHTENING": {
        "description": "Enterprise customer SLAs shortened by 30%",
        "default_additional_tickets": 10,
        "default_agent_reduction": 0,
        "default_sla_change_percent": -30.0,
    },
    "CRITICAL_SURGE": {
        "description": "Major platform outage generating surge of 25 CRITICAL priority tickets",
        "default_additional_tickets": 25,
        "default_agent_reduction": 0,
        "default_sla_change_percent": 0.0,
    },
    "RECOVERY": {
        "description": "Gradual resolution of backlog with 5 temporary surge agents activated",
        "default_additional_tickets": -15,
        "default_agent_reduction": -5,
        "default_sla_change_percent": 0.0,
    },
}
