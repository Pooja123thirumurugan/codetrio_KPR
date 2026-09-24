import os
import logging
from typing import Dict, Any, Tuple
import joblib

from app.core.config import settings

logger = logging.getLogger("sla_guardian.ml.classifier")

# Rule-based fallback keywords and mappings
CATEGORY_RULES = [
    {
        "keywords": ["payment", "charge", "refund", "checkout", "transaction", "credit card", "stripe", "failed payment", "billing charge", "double charge"],
        "category": "Payment Failure",
        "department": "Payments",
        "skills": ["Payments", "Refunds", "Billing"],
    },
    {
        "keywords": ["login", "password", "sso", "2fa", "mfa", "authentication", "locked out", "reset password", "credentials", "unauthorized"],
        "category": "Authentication",
        "department": "Account Support",
        "skills": ["Authentication", "Account Support"],
    },
    {
        "keywords": ["error", "500", "crash", "bug", "api", "timeout", "exception", "server", "gateway", "unresponsive", "broken", "stack trace"],
        "category": "Technical Issue",
        "department": "Technical Support",
        "skills": ["Technical Support"],
    },
    {
        "keywords": ["invoice", "receipt", "tax", "vat", "subscription", "upgrade", "downgrade", "pricing", "plan", "cancel"],
        "category": "Billing Inquiry",
        "department": "Billing",
        "skills": ["Billing", "Subscription"],
    },
    {
        "keywords": ["vulnerability", "security", "exploit", "breach", "leak", "gdpr", "compliance", "audit", "cve"],
        "category": "Security Vulnerability",
        "department": "Security & Compliance",
        "skills": ["Security & Compliance"],
    },
    {
        "keywords": ["feature", "request", "suggestion", "enhancement", "roadmap", "wishlist", "ui improve"],
        "category": "Feature Request",
        "department": "Product Operations",
        "skills": ["Product Operations"],
    },
]


class TicketClassifier:
    """
    Classifies ticket subject and description into Category and Department.
    Uses trained TF-IDF + LogisticRegression / Pipeline if available,
    with deterministic keyword pattern matching fallback.
    """

    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.path.join(settings.MODEL_PATH, "ticket_classifier.joblib")
        self.pipeline = None
        self.is_loaded = False
        self._load_model()

    def _load_model(self) -> None:
        if os.path.exists(self.model_path):
            try:
                self.pipeline = joblib.load(self.model_path)
                self.is_loaded = True
                logger.info(f"Loaded ticket classification model from {self.model_path}")
            except Exception as e:
                logger.warning(f"Could not load ticket classifier: {e}. Using deterministic fallback.")
                self.pipeline = None
                self.is_loaded = False
        else:
            self.pipeline = None
            self.is_loaded = False

    def classify(self, subject: str, description: str, channel: str = "WEB") -> Tuple[str, str, float, bool, str]:
        """
        Returns:
            (category, department, confidence, is_fallback, explanation)
        """
        combined_text = f"{subject} {description}".lower()

        # 1. Try ML model if loaded
        if self.is_loaded and self.pipeline is not None:
            try:
                pred = self.pipeline.predict([combined_text])[0]
                probs = self.pipeline.predict_proba([combined_text])[0]
                conf = float(max(probs))
                dept = self._category_to_department(pred)
                return pred, dept, round(conf, 2), False, f"Classified via NLP model ({pred} with {conf*100:.0f}% confidence)"
            except Exception as e:
                logger.warning(f"Model prediction failed: {e}. Reverting to fallback.")

        # 2. Deterministic rule-based fallback
        matched_category = "General Inquiry"
        matched_department = "General Support"
        highest_score = 0
        matched_rule = None

        for rule in CATEGORY_RULES:
            score = 0
            for kw in rule["keywords"]:
                if kw in combined_text:
                    score += 2 if kw in subject.lower() else 1
            if score > highest_score:
                highest_score = score
                matched_category = rule["category"]
                matched_department = rule["department"]
                matched_rule = rule

        if highest_score > 0:
            confidence = min(0.95, 0.70 + (highest_score * 0.05))
            explanation = f"Matched {highest_score} domain keyword patterns for category '{matched_category}'"
        else:
            confidence = 0.60
            matched_category = "Technical Issue"
            matched_department = "Technical Support"
            explanation = "Default classification based on general query heuristics"

        return matched_category, matched_department, round(confidence, 2), True, explanation

    def _category_to_department(self, category: str) -> str:
        for rule in CATEGORY_RULES:
            if rule["category"].lower() == category.lower():
                return rule["department"]
        return "Technical Support"
