import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.database.init_db import init_db
from app.websocket.manager import ws_manager
from app.websocket.events import WSEventType
from app.api.routes import (
    tickets_router,
    agents_router,
    sla_router,
    routing_router,
    escalations_router,
    simulations_router,
    incidents_router,
    ai_router,
    analytics_router,
    health_router,
)

# Setup logging
setup_logging()
logger = logging.getLogger("sla_guardian.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode...")
    init_db()
    logger.info("Database checked. Ready to serve requests.")
    yield
    logger.info("Shutting down SLA Guardian AI...")


# Tags metadata for clean, structured Swagger UI
tags_metadata = [
    {"name": "System", "description": "Liveness probes, health checks, and subsystem operational statuses."},
    {"name": "Tickets", "description": "Ticket lifecycle management, automated NLP classification, and urgency detection."},
    {"name": "Agents", "description": "Support agent profile management, skills inventory, and live capacity tracking."},
    {"name": "SLA", "description": "Configurable SLA policies, real-time SLA calculation, and ML-powered pre-breach risk prediction."},
    {"name": "Routing", "description": "Intelligent multi-factor agent routing with strict capacity constraints and alternative recommendations."},
    {"name": "Escalations", "description": "Predictive pre-breach escalations, human-in-the-loop approval, and execution workflows."},
    {"name": "Simulations", "description": "Isolated in-memory what-if capacity and load stress simulations."},
    {"name": "Incidents", "description": "Automated incident anomaly detection, severity assessment, and remediation action tracking."},
    {"name": "AI", "description": "Generative first-response drafting with Gemini API and deterministic fallback."},
    {"name": "Analytics", "description": "Aggregated operational KPIs, compliance rates, and capacity distribution analytics."},
]

app = FastAPI(
    title="SLA Guardian AI — Backend API",
    description=(
        "**SLA-Aware Automated Support Ticket Routing & Escalation System**\n\n"
        "*Tagline: Predict. Prevent. Optimize. Resolve.*\n\n"
        "Key capability: **THE SYSTEM PREDICTS SLA BREACHES BEFORE THEY OCCUR** "
        "and triggers pre-breach escalations with human approval workflows."
    ),
    version="2.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for clean, structured error responses

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred. The system remains operational.",
            "path": request.url.path,
        },
    )


# WebSocket operations endpoint
@app.websocket("/ws/operations")
async def websocket_operations_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial welcome event
        await websocket.send_json({
            "event_type": "CONNECTED",
            "message": "Connected to SLA Guardian AI Operational Real-Time Stream",
            "subsystem": "WebSocket Engine",
        })
        while True:
            # Keep connection open and accept any incoming ping/ack messages
            data = await websocket.receive_text()
            logger.debug(f"Received WS text: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)


# Mount routers
app.include_router(health_router)
app.include_router(tickets_router, prefix=settings.API_V1_STR)
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(sla_router, prefix=settings.API_V1_STR)
app.include_router(routing_router, prefix=settings.API_V1_STR)
app.include_router(escalations_router, prefix=settings.API_V1_STR)
app.include_router(simulations_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
