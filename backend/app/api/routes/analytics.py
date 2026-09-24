from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.analytics import (
    OverviewMetrics,
    SLAMetrics,
    RoutingMetrics,
    AgentMetrics,
    EscalationMetrics,
)
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=OverviewMetrics)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Executive KPI overview: volumes, active breaches, SLA compliance rate, agent utilization."""
    return analytics_service.get_overview(db)


@router.get("/sla", response_model=SLAMetrics)
def get_sla_analytics(db: Session = Depends(get_db)):
    """SLA breakdown: compliance rate, safe/warning/at-risk/breached counts, priority & department rates."""
    return analytics_service.get_sla_metrics(db)


@router.get("/routing", response_model=RoutingMetrics)
def get_routing_analytics(db: Session = Depends(get_db)):
    """Routing metrics: auto-routing efficiency, average score, department distributions."""
    return analytics_service.get_routing_metrics(db)


@router.get("/agents", response_model=AgentMetrics)
def get_agent_analytics(db: Session = Depends(get_db)):
    """Agent metrics: availability breakdown, average utilization, top performers and overloaded staff."""
    return analytics_service.get_agent_metrics(db)


@router.get("/escalations", response_model=EscalationMetrics)
def get_escalation_analytics(db: Session = Depends(get_db)):
    """Escalation metrics: approval pipelines, prevented breaches, triggers and level breakdown."""
    return analytics_service.get_escalation_metrics(db)
