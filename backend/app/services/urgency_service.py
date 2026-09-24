import logging
from app.ml.urgency_model import UrgencyDetector
from app.schemas.ticket import TicketUrgencyResponse

logger = logging.getLogger("sla_guardian.services.urgency")


class UrgencyService:
    def __init__(self):
        self.detector = UrgencyDetector()

    def evaluate_urgency(
        self,
        subject: str,
        description: str,
        priority: str = "MEDIUM",
        customer_tier: str = "STANDARD",
    ) -> TicketUrgencyResponse:
        """
        Calculates urgency level, score, signals and explanation.
        """
        urgency, score, confidence, signals, explanation = self.detector.detect(
            subject=subject,
            description=description,
            priority=priority,
            customer_tier=customer_tier,
        )

        return TicketUrgencyResponse(
            urgency=urgency,
            urgency_score=score,
            confidence=confidence,
            is_fallback=False,
            explanation=explanation,
            detected_signals=signals,
        )


urgency_service = UrgencyService()
