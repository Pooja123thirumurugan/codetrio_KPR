import logging
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.models.department import Department
from app.ml.classifier import TicketClassifier
from app.schemas.ticket import TicketClassificationResponse

logger = logging.getLogger("sla_guardian.services.classification")


class ClassificationService:
    def __init__(self):
        self.classifier = TicketClassifier()

    def classify_ticket(
        self,
        db: Session,
        subject: str,
        description: str,
        channel: str = "WEB",
    ) -> TicketClassificationResponse:
        """
        Classifies ticket into Category and Department. Resolves department_id from DB if possible.
        """
        category, dept_name, confidence, is_fallback, explanation = self.classifier.classify(
            subject=subject,
            description=description,
            channel=channel,
        )

        # Lookup department record in database
        dept = db.query(Department).filter(Department.name.ilike(f"%{dept_name}%")).first()
        dept_id = dept.id if dept else None

        return TicketClassificationResponse(
            category=category,
            department=dept_name,
            department_id=dept_id,
            confidence=confidence,
            is_fallback=is_fallback,
            explanation=explanation,
        )


classification_service = ClassificationService()
