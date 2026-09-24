import logging
from typing import Dict, Any

from app.ml.classifier import TicketClassifier
from app.ml.urgency_model import UrgencyDetector
from app.ml.sla_predictor import SLABreachPredictor

logger = logging.getLogger("sla_guardian.ml.registry")


class ModelRegistry:
    """
    Central registry for all AI/ML models in SLA Guardian AI.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelRegistry, cls).__new__(cls)
            cls._instance._init_models()
        return cls._instance

    def _init_models(self) -> None:
        logger.info("Initializing Model Registry...")
        self.classifier = TicketClassifier()
        self.urgency_detector = UrgencyDetector()
        self.sla_predictor = SLABreachPredictor()
        logger.info("Model Registry initialized.")

    def get_status(self) -> Dict[str, Any]:
        return {
            "ticket_classifier": {
                "loaded": self.classifier.is_loaded,
                "type": "TF-IDF + LogisticRegression" if self.classifier.is_loaded else "Deterministic Rule-based Fallback",
                "status": "ready",
            },
            "urgency_detector": {
                "loaded": True,
                "type": "Hybrid Signal & Business Rules",
                "status": "ready",
            },
            "sla_predictor": {
                "loaded": self.sla_predictor.is_loaded,
                "type": "XGBoost Classifier" if self.sla_predictor.is_loaded else "Deterministic Fallback Predictor",
                "status": "ready",
            },
        }


model_registry = ModelRegistry()
