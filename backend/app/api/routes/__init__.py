from app.api.routes.tickets import router as tickets_router
from app.api.routes.agents import router as agents_router
from app.api.routes.sla import router as sla_router
from app.api.routes.routing import router as routing_router
from app.api.routes.escalations import router as escalations_router
from app.api.routes.simulations import router as simulations_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.ai import router as ai_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.health import router as health_router

__all__ = [
    "tickets_router",
    "agents_router",
    "sla_router",
    "routing_router",
    "escalations_router",
    "simulations_router",
    "incidents_router",
    "ai_router",
    "analytics_router",
    "health_router",
]
