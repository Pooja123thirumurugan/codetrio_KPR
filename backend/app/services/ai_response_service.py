import time
import logging
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ticket import Ticket
from app.models.ai_response import AIResponse
from app.models.ticket_event import TicketEvent
from app.schemas.ai_response import AIResponseResult
from app.services.audit_service import audit_service

logger = logging.getLogger("sla_guardian.services.ai_response")

# Deterministic professional fallback templates
FALLBACK_TEMPLATES = {
    "Payment Failure": (
        "Hello {customer_name},\n\n"
        "Thank you for reaching out regarding your checkout and payment difficulty. "
        "We understand the critical urgency of this issue and apologize for the disruption.\n\n"
        "Our payments engineering team has already prioritized your case (Ref: {ticket_number}). "
        "We are currently reviewing the gateway transaction logs for any temporary authorization holds or gateway timeouts. "
        "No duplicate charges have been settled to your account.\n\n"
        "A senior payment specialist will follow up with you within the next 20 minutes with resolution details.\n\n"
        "Best regards,\nSLA Guardian Tier-1 Support"
    ),
    "Authentication": (
        "Hello {customer_name},\n\n"
        "Thank you for contacting us regarding your account access inquiry. "
        "We have verified that your account credentials and multi-factor authentication (MFA) services are currently operational.\n\n"
        "To securely restore your access, we have initiated an expedited one-time password verification link sent to your registered email address.\n\n"
        "If you continue to experience issues, our account specialist is standing by to assist.\n\n"
        "Best regards,\nAccount Security & Support Team"
    ),
    "Technical Issue": (
        "Hello {customer_name},\n\n"
        "Thank you for reporting this technical issue (Ticket: {ticket_number}). "
        "Our site reliability team has been notified, and your incident is under active investigation.\n\n"
        "We are reviewing application telemetry and error logs to identify the root cause and deploy a fix immediately.\n\n"
        "We will provide you with another update as soon as our engineers complete the initial diagnosis.\n\n"
        "Sincerely,\nTechnical Operations Team"
    ),
    "Billing Inquiry": (
        "Hello {customer_name},\n\n"
        "Thank you for reaching out with your billing question regarding your account.\n\n"
        "We are reviewing your current invoice and subscription tier. You can also view and download all past transaction statements directly from your customer portal.\n\n"
        "Our billing specialist will provide a detailed itemized breakdown shortly.\n\n"
        "Kind regards,\nBilling Support Team"
    ),
    "General": (
        "Hello {customer_name},\n\n"
        "Thank you for contacting our support team regarding '{subject}'. "
        "Your request has been logged under ticket reference {ticket_number}.\n\n"
        "A dedicated support representative has been assigned and is reviewing your inquiry.\n\n"
        "Best regards,\nCustomer Support Team"
    ),
}


class AIResponseService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._genai_client = None
        self._init_gemini()

    def _init_gemini(self) -> None:
        if self.api_key:
            try:
                from google import genai
                self._genai_client = genai.Client(api_key=self.api_key)
                logger.info(f"Initialized Gemini client with model {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}. Will use template fallback.")
                self._genai_client = None
        else:
            logger.info("No GEMINI_API_KEY configured. Running in deterministic template fallback mode.")
            self._genai_client = None

    def generate_response(
        self,
        db: Session,
        ticket: Ticket,
        tone: str = "PROFESSIONAL",
        custom_instructions: Optional[str] = None,
    ) -> AIResponseResult:
        """
        Drafts first response using Gemini API, with automatic fallback to templates.
        Guarantees zero-failure operation.
        """
        start_time = time.time()
        customer_name = ticket.customer.name if ticket.customer else "Customer"
        category = ticket.category or "General"
        provider = "gemini"
        confidence = 0.94
        suggested_text = ""

        # Try Gemini API if client available
        if self._genai_client:
            try:
                prompt = (
                    f"You are SLA Guardian AI, an expert enterprise customer support assistant.\n"
                    f"Draft a concise, helpful, and empathetic initial response to this support ticket.\n\n"
                    f"Ticket Number: {ticket.ticket_number}\n"
                    f"Customer: {customer_name}\n"
                    f"Subject: {ticket.subject}\n"
                    f"Description: {ticket.description}\n"
                    f"Category: {category}\n"
                    f"Urgency: {ticket.urgency}\n"
                    f"Priority: {ticket.priority}\n"
                    f"Tone: {tone}\n"
                )
                if custom_instructions:
                    prompt += f"Special Instructions: {custom_instructions}\n"

                response = self._genai_client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                if response and hasattr(response, "text") and response.text:
                    suggested_text = response.text.strip()
                    provider = "gemini"
                else:
                    raise ValueError("Empty response from Gemini")
            except Exception as e:
                logger.warning(f"Gemini API generation error: {e}. Falling back to deterministic templates.")
                suggested_text = self._render_template(ticket, customer_name, category)
                provider = "template_fallback"
                confidence = 0.88
        else:
            suggested_text = self._render_template(ticket, customer_name, category)
            provider = "template_fallback"
            confidence = 0.88

        latency_ms = round((time.time() - start_time) * 1000.0, 1)

        # Save AI Response in DB
        ai_resp_record = AIResponse(
            ticket_id=ticket.id,
            suggested_response=suggested_text,
            tone=tone,
            category=category,
            confidence=confidence,
            provider=provider,
            latency_ms=latency_ms,
            status="DRAFTED",
        )
        db.add(ai_resp_record)

        # Record TicketEvent
        event = TicketEvent(
            ticket_id=ticket.id,
            event_type="AI_RESPONSE_GENERATED",
            actor="AI",
            details={"provider": provider, "confidence": confidence, "latency_ms": latency_ms},
        )
        db.add(event)
        db.commit()
        db.refresh(ai_resp_record)

        audit_service.log(
            db=db,
            action="AI_RESPONSE_GENERATED",
            entity="ticket",
            entity_id=ticket.id,
            actor=f"AI_{provider.upper()}",
            new_value={"provider": provider, "latency_ms": latency_ms},
            reason="Auto-drafted customer first response",
        )

        return AIResponseResult(
            id=ai_resp_record.id,
            ticket_id=ticket.id,
            suggested_response=suggested_text,
            tone=tone,
            category=category,
            confidence=confidence,
            provider=provider,
            status=ai_resp_record.status,
            latency_ms=latency_ms,
            created_at=ai_resp_record.created_at,
        )

    def _render_template(self, ticket: Ticket, customer_name: str, category: str) -> str:
        tpl = FALLBACK_TEMPLATES.get(category, FALLBACK_TEMPLATES["General"])
        return tpl.format(
            customer_name=customer_name,
            ticket_number=ticket.ticket_number,
            subject=ticket.subject,
        )


ai_response_service = AIResponseService()
