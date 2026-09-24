from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.api.deps import get_db
from app.core.config import settings
from app.ml.model_registry import model_registry
from app.services.ai_response_service import ai_response_service
from app.websocket.manager import ws_manager

router = APIRouter(tags=["System"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    """Basic liveness and database connectivity probe."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {e}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "service": "SLA Guardian AI",
        "version": settings.PROJECT_NAME,
    }


@router.get("/api/system/status")
def system_status(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Comprehensive subsystem operational health:
    - Application status
    - Database status
    - ML model statuses (Classifier, Urgency, SLA Predictor)
    - AI provider status ('available' with Gemini or 'fallback' with templates)
    - WebSocket active connections
    """
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {e}"

    models = model_registry.get_status()

    # Determine AI provider status
    ai_status = "available" if ai_response_service._genai_client is not None else "fallback"

    return {
        "application": "healthy",
        "database": db_status,
        "sla_model": "loaded" if models["sla_predictor"]["loaded"] else "fallback_predictor",
        "classifier_model": "loaded" if models["ticket_classifier"]["loaded"] else "rule_fallback",
        "ai_provider": ai_status,
        "websocket": {
            "status": "active",
            "active_clients": ws_manager.get_active_count(),
        },
        "model_registry": models,
        "environment": settings.ENVIRONMENT,
    }
