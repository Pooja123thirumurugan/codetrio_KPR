import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.ticket import Ticket
from app.models.customer import Customer
from app.models.department import Department
from app.models.sla_policy import SLAPolicy
from app.models.ticket_event import TicketEvent
from app.models.sla_prediction import SLAPrediction
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse
from app.services.classification_service import classification_service
from app.services.urgency_service import urgency_service
from app.services.sla_service import sla_service
from app.services.audit_service import audit_service


class TicketService:
    def create_ticket(self, db: Session, ticket_in: TicketCreate) -> Ticket:
        # 1. Resolve or create customer
        customer = None
        if ticket_in.customer_id:
            customer = db.query(Customer).filter(Customer.id == ticket_in.customer_id).first()

        if not customer and ticket_in.customer_email:
            customer = db.query(Customer).filter(Customer.email == ticket_in.customer_email).first()
            if not customer:
                customer = Customer(
                    name=ticket_in.customer_name or ticket_in.customer_email.split("@")[0].title(),
                    email=ticket_in.customer_email,
                    company=ticket_in.customer_name or "Independent",
                    tier="STANDARD",
                )
                db.add(customer)
                db.flush()

        if not customer:
            # Fallback default customer
            customer = db.query(Customer).first()
            if not customer:
                customer = Customer(name="Valued Customer", email="customer@example.com", company="Acme Corp", tier="STANDARD")
                db.add(customer)
                db.flush()

        # 2. Automated Classification (if not manually specified)
        category = ticket_in.category
        dept_id = ticket_in.department_id
        dept_name = None

        if not category or not dept_id:
            cls_result = classification_service.classify_ticket(
                db=db,
                subject=ticket_in.subject,
                description=ticket_in.description,
                channel=ticket_in.channel,
            )
            if not category:
                category = cls_result.category
            if not dept_id:
                dept_id = cls_result.department_id
            dept_name = cls_result.department

        # 3. Automated Urgency Detection (if not specified)
        urgency = ticket_in.urgency
        if not urgency:
            urg_result = urgency_service.evaluate_urgency(
                subject=ticket_in.subject,
                description=ticket_in.description,
                priority=ticket_in.priority or "MEDIUM",
                customer_tier=customer.tier if customer else "STANDARD",
            )
            urgency = urg_result.urgency

        priority = ticket_in.priority or urgency or "MEDIUM"

        # 4. Select SLA Policy and Deadlines
        policy = sla_service.select_policy(db, priority=priority, customer_tier=customer.tier if customer else "STANDARD")
        now = datetime.now(timezone.utc)
        res_minutes = policy.resolution_minutes if policy else 240
        sla_deadline = now + timedelta(minutes=res_minutes)
        first_resp_deadline = now + timedelta(minutes=policy.first_response_minutes if policy else 60)

        # Generate readable unique ticket number
        existing_numbers = {t[0] for t in db.query(Ticket.ticket_number).all()}
        count = db.query(Ticket).count() + 1
        num = 1000 + count
        while f"TCK-{num}" in existing_numbers:
            num += 1
        ticket_number = f"TCK-{num}"

        # 5. Create Ticket Record
        ticket = Ticket(
            ticket_number=ticket_number,
            customer_id=customer.id,
            department_id=dept_id,
            department_name=dept_name,
            sla_policy_id=policy.id if policy else None,
            subject=ticket_in.subject,
            description=ticket_in.description,
            category=category,
            urgency=urgency,
            priority=priority,
            status="OPEN",
            channel=ticket_in.channel or "WEB",
            sla_deadline=sla_deadline,
            first_response_deadline=first_resp_deadline,
            tags=ticket_in.tags or [],
        )
        db.add(ticket)
        db.flush()

        # Log TicketEvent
        event = TicketEvent(
            ticket_id=ticket.id,
            event_type="CREATED",
            actor="SYSTEM",
            details={
                "ticket_number": ticket_number,
                "category": category,
                "urgency": urgency,
                "priority": priority,
                "sla_resolution_minutes": res_minutes,
            },
        )
        db.add(event)
        db.commit()
        db.refresh(ticket)

        audit_service.log(
            db=db,
            action="TICKET_CREATED",
            entity="ticket",
            entity_id=ticket.id,
            actor="SYSTEM",
            new_value={"ticket_number": ticket_number, "subject": ticket.subject},
            reason="Customer ticket initiated",
        )

        # 6. Compute Initial SLA Risk Prediction
        try:
            sla_service.predict_breach_risk(db, ticket)
        except Exception:
            pass  # Do not block creation if prediction encounters edge case

        return ticket

    def get_ticket(self, db: Session, ticket_id: str) -> Optional[Ticket]:
        # Support lookup by UUID or Ticket Number (e.g. TCK-1048)
        ticket = db.query(Ticket).filter(
            (Ticket.id == ticket_id) | (Ticket.ticket_number == ticket_id)
        ).first()
        return ticket

    def list_tickets(
        self,
        db: Session,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        department_id: Optional[str] = None,
        assigned_agent_id: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> List[Ticket]:
        q = db.query(Ticket)
        if status:
            q = q.filter(Ticket.status == status.upper())
        if priority:
            q = q.filter(Ticket.priority == priority.upper())
        if department_id:
            q = q.filter(Ticket.department_id == department_id)
        if assigned_agent_id:
            q = q.filter(Ticket.assigned_agent_id == assigned_agent_id)

        return q.order_by(desc(Ticket.created_at)).offset(skip).limit(limit).all()

    def update_ticket(self, db: Session, ticket_id: str, ticket_in: TicketUpdate) -> Optional[Ticket]:
        ticket = self.get_ticket(db, ticket_id)
        if not ticket:
            return None

        old_data = {"status": ticket.status, "priority": ticket.priority}
        update_data = ticket_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(ticket, field, value)

        if ticket_in.status == "RESOLVED" and not ticket.resolved_at:
            ticket.resolved_at = datetime.now(timezone.utc)
            if ticket.assigned_agent and ticket.assigned_agent.active_ticket_count > 0:
                ticket.assigned_agent.active_ticket_count -= 1
                ticket.assigned_agent.utilization = round(
                    ticket.assigned_agent.active_ticket_count / max(1, ticket.assigned_agent.max_capacity), 2
                )
                if ticket.assigned_agent.status == "AT_CAPACITY":
                    ticket.assigned_agent.status = "BUSY"

        db.commit()
        db.refresh(ticket)

        audit_service.log(
            db=db,
            action="TICKET_UPDATED",
            entity="ticket",
            entity_id=ticket.id,
            actor="SYSTEM",
            old_value=old_data,
            new_value=update_data,
        )
        return ticket

    def to_response_dto(self, db: Session, ticket: Ticket) -> TicketResponse:
        """Enriches Ticket model with real-time computed SLA and Risk metrics."""
        sla_calc = sla_service.calculate_sla(ticket)

        latest_pred = db.query(SLAPrediction).filter(
            SLAPrediction.ticket_id == ticket.id
        ).order_by(desc(SLAPrediction.created_at)).first()

        breach_prob = latest_pred.breach_probability if latest_pred else 0.25
        risk_lvl = latest_pred.risk_level if latest_pred else "LOW"

        return TicketResponse(
            id=ticket.id,
            ticket_number=ticket.ticket_number,
            subject=ticket.subject,
            description=ticket.description,
            channel=ticket.channel,
            customer_id=ticket.customer_id,
            priority=ticket.priority,
            urgency=ticket.urgency,
            category=ticket.category,
            department_id=ticket.department_id,
            department_name=ticket.department.name if ticket.department else ticket.department_name,
            assigned_agent_id=ticket.assigned_agent_id,
            assigned_agent_name=ticket.assigned_agent.name if ticket.assigned_agent else None,
            sla_policy_id=ticket.sla_policy_id,
            status=ticket.status,
            tags=ticket.tags or [],
            metadata_json=ticket.metadata_json,
            sla_deadline=ticket.sla_deadline,
            first_response_deadline=ticket.first_response_deadline,
            first_responded_at=ticket.first_responded_at,
            resolved_at=ticket.resolved_at,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            sla_status=sla_calc.status,
            remaining_sla_minutes=sla_calc.remaining_minutes,
            breach_probability=breach_prob,
            risk_level=risk_lvl,
        )


ticket_service = TicketService()
