import os
import logging
from typing import Dict, Any, Tuple, List
import joblib

from app.core.config import settings
from app.ml.feature_engineering import to_vector
from app.ml.fallback_predictor import FallbackSLAPredictor

logger = logging.getLogger("sla_guardian.ml.sla_predictor")


class SLABreachPredictor:
    """
    SLA Breach Predictor using XGBoost / ensemble machine learning, with seamless fallback.
    """

    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.path.join(settings.MODEL_PATH, "sla_xgboost.joblib")
        self.model = None
        self.fallback = FallbackSLAPredictor()
        self.is_loaded = False
        self._load_model()

    def _load_model(self) -> None:
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                self.is_loaded = True
                logger.info(f"Loaded trained SLA Breach model from {self.model_path}")
            except Exception as e:
                logger.warning(f"Failed to load SLA model from {self.model_path}: {e}. Using fallback predictor.")
                self.model = None
                self.is_loaded = False
        else:
            logger.info(f"No trained model artifact at {self.model_path}. Using fallback predictor.")
            self.model = None
            self.is_loaded = False

    def predict(self, features: Dict[str, float]) -> Tuple[float, str, float, List[str], bool]:
        """
        Calculates SLA breach risk probability, risk level, confidence, and contributing factors.

        Returns:
            (breach_probability, risk_level, confidence, contributing_factors, is_fallback)
        """
        # Always compute baseline factors from fallback engine for rich explanations
        _, _, _, factor_explanations = self.fallback.predict(features)

        if self.is_loaded and self.model is not None:
            try:
                X = to_vector(features)
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(X)
                    breach_prob = float(probs[0][1])
                else:
                    raw_pred = self.model.predict(X)
                    breach_prob = float(raw_pred[0])

                breach_prob = round(min(0.99, max(0.01, breach_prob)), 3)

                if breach_prob >= 0.75:
                    risk_level = "CRITICAL"
                elif breach_prob >= 0.50:
                    risk_level = "HIGH"
                elif breach_prob >= 0.25:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"

                return breach_prob, risk_level, 0.92, factor_explanations, False
            except Exception as e:
                logger.warning(f"Error executing ML model: {e}. Reverting to fallback predictor.")

        # Deterministic fallback prediction
        breach_prob, risk_level, confidence, factors = self.fallback.predict(features)
        return breach_prob, risk_level, confidence, factors, True
