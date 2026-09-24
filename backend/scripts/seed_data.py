import os
import sys
import uuid
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

# Ensure backend root is on sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database.session import engine, SessionLocal
from app.database.init_db import init_db
from app.models import (
    Customer,
    Department,
    Agent,
    Skill,
    SLAPolicy,
    Ticket,
    TicketEvent,
    SLAPrediction,
    RoutingDecision,
    Escalation,
    Incident,
    IncidentAction,
    AuditLog,
)


def seed_database():
    print("Ensuring database tables exist...")
    init_db()
    db: Session = SessionLocal()

    try:
        # Check if already seeded with TCK-1048
        existing_tck = db.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
        if existing_tck:
            print("Database already contains seeded scenario TCK-1048. Refreshing seed records...")
            # We can purge tickets or continue

        print("Seeding Skills...")
        skills_data = [
            ("Payments", "Financial transactions and gateway integrations"),
            ("Billing", "Invoicing, subscription tiers, and charges"),
            ("Refunds", "Payment reversals and credit balance reconciliation"),
            ("Authentication", "SSO, MFA, password resets, and session management"),
            ("Technical Support", "API errors, server exceptions, and stack traces"),
            ("Account Support", "Profile configuration, tenant settings, and roles"),
            ("Subscription", "Upgrades, downgrades, and contract term changes"),
            ("Security & Compliance", "Vulnerabilities, CVEs, access audits, and GDPR"),
            ("Product Operations", "Feature requests and operational workflow setups"),
        ]
        skills_map = {}
        for s_name, s_desc in skills_data:
            skill = db.query(Skill).filter(Skill.name == s_name).first()
            if not skill:
                skill = Skill(name=s_name, description=s_desc)
                db.add(skill)
                db.flush()
            skills_map[s_name] = skill

        print("Seeding Departments...")
        departments_data = [
            ("Payments", "PAY", "Handles transaction processing, chargebacks, and gateway errors"),
            ("Billing", "BIL", "Handles customer invoices, subscriptions, and receipts"),
            ("Account Support", "ACC", "Handles identity, authentication, and login access"),
            ("Technical Support", "TEC", "Handles bug reports, system errors, and API integrations"),
            ("Security & Compliance", "SEC", "Handles security advisories and regulatory compliance"),
            ("Product Operations", "OPS", "Handles platform configuration and feature requests"),
        ]
        dept_map = {}
        for d_name, d_code, d_desc in departments_data:
            dept = db.query(Department).filter(Department.name == d_name).first()
            if not dept:
                dept = Department(name=d_name, code=d_code, description=d_desc)
                db.add(dept)
                db.flush()
            dept_map[d_name] = dept

        print("Seeding SLA Policies...")
        sla_policies_data = [
            ("CRITICAL_30_MIN", "CRITICAL", "ENTERPRISE", 10, 30, 70.0, 85.0),
            ("CRITICAL_VIP", "CRITICAL", "VIP", 5, 20, 65.0, 80.0),
            ("HIGH_60_MIN", "HIGH", "STANDARD", 20, 60, 75.0, 90.0),
            ("MEDIUM_240_MIN", "MEDIUM", "STANDARD", 60, 240, 75.0, 90.0),
            ("LOW_480_MIN", "LOW", "STANDARD", 120, 480, 80.0, 90.0),
        ]
        sla_map = {}
        for p_name, prio, tier, resp_m, res_m, w_pct, e_pct in sla_policies_data:
            policy = db.query(SLAPolicy).filter(SLAPolicy.name == p_name).first()
            if not policy:
                policy = SLAPolicy(
                    name=p_name,
                    priority=prio,
                    customer_tier=tier,
                    first_response_minutes=resp_m,
                    resolution_minutes=res_m,
                    warning_threshold_percent=w_pct,
                    escalation_threshold_percent=e_pct,
                    auto_escalation_enabled=True,
                )
                db.add(policy)
                db.flush()
            sla_map[prio] = policy

        print("Seeding Customers...")
        customers_data = [
            ("Acme Global Payments", "support@acme-global.com", "ENTERPRISE", "Acme Corp"),
            ("Nexus Retail Systems", "tech@nexus-retail.io", "VIP", "Nexus Retail Ltd"),
            ("Vertex Logistics", "ops@vertex-logistics.com", "PREMIUM", "Vertex Group"),
            ("Apex Solutions", "billing@apex-sol.com", "STANDARD", "Apex Solutions Inc"),
            ("Quantum Data Cloud", "admin@quantum-cloud.net", "ENTERPRISE", "Quantum Cloud"),
            ("Horizon Retail", "contact@horizon-store.com", "STANDARD", "Horizon Direct"),
        ]
        cust_list = []
        for c_name, c_email, c_tier, c_comp in customers_data:
            cust = db.query(Customer).filter(Customer.email == c_email).first()
            if not cust:
                cust = Customer(name=c_name, email=c_email, tier=c_tier, company=c_comp)
                db.add(cust)
                db.flush()
            cust_list.append(cust)

        print("Seeding 12 Realistic Agents...")
        agents_data = [
            ("Priya Sharma", "priya.sharma@slaguardian.ai", "Payments", "AVAILABLE", 5, 2, 0.40, 24.0, 0.02, ["Payments", "Refunds", "Billing"]),
            ("Marcus Chen", "marcus.chen@slaguardian.ai", "Payments", "AT_CAPACITY", 5, 5, 1.00, 32.0, 0.04, ["Payments", "Billing"]),
            ("Elena Rostova", "elena.rostova@slaguardian.ai", "Payments", "BUSY", 4, 3, 0.75, 28.0, 0.03, ["Payments", "Refunds"]),
            ("David Kim", "david.kim@slaguardian.ai", "Account Support", "AVAILABLE", 6, 2, 0.33, 20.0, 0.01, ["Authentication", "Account Support"]),
            ("Sarah Jenkins", "sarah.jenkins@slaguardian.ai", "Account Support", "BUSY", 5, 4, 0.80, 25.0, 0.05, ["Authentication", "Account Support"]),
            ("Alex Rivera", "alex.rivera@slaguardian.ai", "Technical Support", "AVAILABLE", 4, 1, 0.25, 45.0, 0.04, ["Technical Support"]),
            ("Tariq Al-Mansoor", "tariq.mansoor@slaguardian.ai", "Technical Support", "BUSY", 5, 4, 0.80, 50.0, 0.06, ["Technical Support"]),
            ("Chloe Bennett", "chloe.bennett@slaguardian.ai", "Billing", "AVAILABLE", 6, 1, 0.17, 30.0, 0.02, ["Billing", "Subscription"]),
            ("Vikram Patel", "vikram.patel@slaguardian.ai", "Billing", "BUSY", 5, 3, 0.60, 35.0, 0.03, ["Billing", "Subscription"]),
            ("Aisha Diallo", "aisha.diallo@slaguardian.ai", "Security & Compliance", "AVAILABLE", 4, 1, 0.25, 30.0, 0.01, ["Security & Compliance"]),
            ("Lucas Meyer", "lucas.meyer@slaguardian.ai", "Product Operations", "AVAILABLE", 5, 1, 0.20, 40.0, 0.02, ["Product Operations"]),
            ("Kenji Sato", "kenji.sato@slaguardian.ai", "Payments", "OFFLINE", 5, 0, 0.00, 30.0, 0.05, ["Payments"]),
        ]

        agent_map = {}
        for a_name, a_email, d_name, a_status, a_cap, a_act, a_util, a_avg, a_brch, a_skills in agents_data:
            ag = db.query(Agent).filter(Agent.email == a_email).first()
            if not ag:
                ag = Agent(
                    name=a_name,
                    email=a_email,
                    department_id=dept_map[d_name].id,
                    status=a_status,
                    max_capacity=a_cap,
                    active_ticket_count=a_act,
                    utilization=a_util,
                    average_resolution_minutes=a_avg,
                    sla_breach_rate=a_brch,
                    availability=(a_status != "OFFLINE"),
                )
                for sk_name in a_skills:
                    if sk_name in skills_map:
                        ag.skills.append(skills_map[sk_name])
                db.add(ag)
                db.flush()
            else:
                ag.status = a_status
                ag.active_ticket_count = a_act
                ag.max_capacity = a_cap
                ag.utilization = a_util
                ag.availability = (a_status != "OFFLINE")
            agent_map[a_name] = ag

        # -------------------------------------------------------------
        # 🚨 FINAL BACKEND DEMO SCENARIO: TCK-1048
        # -------------------------------------------------------------
        print("Seeding Critical Demo Scenario: TCK-1048...")
        now = datetime.now(timezone.utc)
        # Created 12 minutes ago -> SLA is 30 mins -> Remaining is 18 mins
        created_12m_ago = now - timedelta(minutes=12)
        deadline_18m_future = created_12m_ago + timedelta(minutes=30)

        # Ensure policy is 30 mins
        policy_30m = db.query(SLAPolicy).filter(SLAPolicy.name == "CRITICAL_30_MIN").first()
        if not policy_30m:
            policy_30m = sla_map.get("CRITICAL")

        tck_1048 = db.query(Ticket).filter(Ticket.ticket_number == "TCK-1048").first()
        if not tck_1048:
            tck_1048 = Ticket(
                ticket_number="TCK-1048",
                customer_id=cust_list[0].id,
                department_id=dept_map["Payments"].id,
                department_name="Payments",
                sla_policy_id=policy_30m.id,
                subject="Payment failure during checkout",
                description=(
                    "CRITICAL CHECKOUT OUTAGE: Multiple enterprise customers report credit card payments failing "
                    "with HTTP 504 Gateway Timeout during checkout. Revenue impact is actively accumulating."
                ),
                category="Payment Failure",
                urgency="CRITICAL",
                priority="CRITICAL",
                status="ESCALATED",
                channel="WEB",
                assigned_agent_id=agent_map["Marcus Chen"].id,  # Marcus is at 100% capacity
                created_at=created_12m_ago,
                updated_at=now,
                sla_deadline=deadline_18m_future,
                first_response_deadline=created_12m_ago + timedelta(minutes=10),
                first_responded_at=created_12m_ago + timedelta(minutes=6),
            )
            db.add(tck_1048)
            db.flush()
        else:
            # Refresh timestamps dynamically so remaining SLA is always 18 mins
            tck_1048.created_at = created_12m_ago
            tck_1048.sla_deadline = deadline_18m_future
            tck_1048.sla_policy_id = policy_30m.id
            tck_1048.status = "ESCALATED"
            db.flush()


        # Ensure pre-breach SLA prediction exists
        db.query(SLAPrediction).filter(SLAPrediction.ticket_id == tck_1048.id).delete()
        pred_1048 = SLAPrediction(
            ticket_id=tck_1048.id,
            breach_probability=0.82,
            risk_level="CRITICAL",
            predicted_breach_time_minutes=18.0,
            confidence=0.89,
            queue_depth_at_prediction=24,
            department_queue_depth=16,
            agent_utilization_at_prediction=1.00,
            sla_consumed_percent=40.0,
            remaining_sla_minutes=18.0,
            risk_velocity=0.22,
            contributing_factors=[
                "High department queue depth (24 open tickets)",
                "Assigned agent Marcus Chen at 100% maximum capacity",
                "SLA remaining below 20 minutes (18m left)",
                "Accelerating risk velocity (+22% in last 10 minutes)",
            ],
            model_version="xgb-sla-v1.0",
            is_fallback=False,
            created_at=now,
        )
        db.add(pred_1048)

        # Ensure Pre-Breach Escalation exists
        db.query(Escalation).filter(Escalation.ticket_id == tck_1048.id).delete()
        esc_1048 = Escalation(
            ticket_id=tck_1048.id,
            level="LEVEL_2",
            trigger_type="PRE_BREACH",
            machine_reason="HIGH_BREACH_PROBABILITY",
            human_reason=(
                "Current queue pressure, agent capacity and remaining SLA time "
                "indicate a high probability of SLA breach before resolution."
            ),
            risk_probability_at_trigger=0.82,
            remaining_sla_minutes_at_trigger=18.0,
            status="PENDING_APPROVAL",
            suggested_actions=[
                "Reassign from Marcus Chen (100% capacity) to Priya Sharma (40% capacity)",
                "Alert Team Lead / Payments on-call supervisor immediately",
                "Send priority escalation notice to merchant",
            ],
            created_at=now,
        )
        db.add(esc_1048)

        # Ensure routing decision exists
        db.query(RoutingDecision).filter(RoutingDecision.ticket_id == tck_1048.id).delete()
        route_1048 = RoutingDecision(
            ticket_id=tck_1048.id,
            recommended_agent_id=agent_map["Priya Sharma"].id,
            overall_score=0.91,
            confidence=0.89,
            skill_match_score=1.0,
            capacity_score=0.85,
            sla_suitability_score=0.90,
            queue_load_score=0.80,
            historical_performance_score=0.95,
            reasons=[
                "Required payment skill",
                "42% current utilization (3 capacity slots open)",
                "Strong SLA performance (<2% historical breaches)",
                "Suitable for critical ticket",
                "Low queue load",
            ],
            alternatives=[
                {
                    "agent_id": agent_map["Elena Rostova"].id,
                    "name": "Elena Rostova",
                    "score": 0.74,
                    "reasons": ["Has payment skill", "Higher current utilization (75%)"],
                }
            ],
            status="RECOMMENDED",
            created_at=now,
        )
        db.add(route_1048)

        # Log audit trail for TCK-1048
        audit_1048 = AuditLog(
            action="ESCALATION_TRIGGERED",
            entity="ticket",
            entity_id=tck_1048.id,
            actor="PREDICTIVE_ENGINE",
            reason="Pre-breach predictive escalation triggered at 82% breach risk with 18m remaining",
        )
        db.add(audit_1048)


        # -------------------------------------------------------------
        # Seed 30+ Active & Varied Tickets across Departments
        # -------------------------------------------------------------
        print("Seeding 32 additional operational tickets across risk states...")
        ticket_templates = [
            ("Double billing on monthly subscription", "Billing", "HIGH", "Billing", "Sarah Jenkins", 45, 60),
            ("Cannot login via Google SSO", "Authentication", "MEDIUM", "Account Support", "David Kim", 30, 240),
            ("API endpoint /v1/orders timing out with 504", "Technical Issue", "CRITICAL", "Technical Support", "Alex Rivera", 15, 30),
            ("Webhook signature verification failed", "Technical Issue", "HIGH", "Technical Support", "Tariq Al-Mansoor", 40, 60),
            ("Request to change tax exemption certificate", "Billing Inquiry", "LOW", "Billing", "Chloe Bennett", 120, 480),
            ("Feature suggestion: Export audit logs to S3", "Feature Request", "LOW", "Product Operations", "Lucas Meyer", 300, 480),
            ("Suspected unauthorized token access from IP", "Security Vulnerability", "CRITICAL", "Security & Compliance", "Aisha Diallo", 10, 30),
            ("Refund request for duplicated cart transaction", "Payment Failure", "HIGH", "Payments", "Priya Sharma", 25, 60),
            ("Customer password reset link returns 404", "Authentication", "HIGH", "Account Support", "David Kim", 35, 60),
            ("Stripe webhook delivery lagging by 15 minutes", "Payment Failure", "MEDIUM", "Payments", "Elena Rostova", 50, 240),
            ("Unable to download invoice PDF from billing portal", "Billing Inquiry", "MEDIUM", "Billing", "Vikram Patel", 60, 240),
            ("Database deadlock during checkout batch run", "Technical Issue", "HIGH", "Technical Support", "Alex Rivera", 20, 60),
            ("Request for SOC2 compliance report document", "Security Vulnerability", "LOW", "Security & Compliance", "Aisha Diallo", 180, 480),
            ("Add team member role permissions not saving", "Account Support", "MEDIUM", "Account Support", "Sarah Jenkins", 90, 240),
            ("Currency conversion mismatch on JPY purchases", "Payment Failure", "HIGH", "Payments", "Priya Sharma", 40, 60),
            ("Invoice receipt shows wrong company entity name", "Billing Inquiry", "LOW", "Billing", "Chloe Bennett", 210, 480),
            ("Gateway rejects card with error code 5012", "Payment Failure", "MEDIUM", "Payments", "Elena Rostova", 80, 240),
            ("Session token expires every 2 minutes", "Authentication", "HIGH", "Account Support", "David Kim", 15, 60),
            ("Bulk user import CSV upload failing", "Technical Issue", "MEDIUM", "Technical Support", "Tariq Al-Mansoor", 110, 240),
            ("Update contract billing term from monthly to annual", "Billing Inquiry", "MEDIUM", "Billing", "Vikram Patel", 140, 240),
            ("Rate limiting kicking in prematurely on API", "Technical Issue", "HIGH", "Technical Support", "Alex Rivera", 30, 60),
            ("Card validation fails on Android mobile app", "Payment Failure", "HIGH", "Payments", "Priya Sharma", 22, 60),
            ("User MFA authenticator app desynced", "Authentication", "MEDIUM", "Account Support", "Sarah Jenkins", 45, 240),
            ("SSL handshake error on client custom domain", "Technical Issue", "HIGH", "Technical Support", "Alex Rivera", 18, 60),
            ("Credit card CVV check failing falsely", "Payment Failure", "MEDIUM", "Payments", "Elena Rostova", 65, 240),
            ("Dark mode styling contrast issue on settings table", "Feature Request", "LOW", "Product Operations", "Lucas Meyer", 250, 480),
            ("Incomplete chargeback dispute file submitted", "Payment Failure", "HIGH", "Payments", "Priya Sharma", 35, 60),
            ("2FA backup codes not generating", "Authentication", "HIGH", "Account Support", "David Kim", 28, 60),
            ("Billing payment method update button disabled", "Billing Inquiry", "MEDIUM", "Billing", "Chloe Bennett", 75, 240),
            ("API key rotation revoked active integration", "Technical Issue", "CRITICAL", "Technical Support", "Tariq Al-Mansoor", 8, 30),
            ("Audit trail export missing timestamp column", "Security Vulnerability", "MEDIUM", "Security & Compliance", "Aisha Diallo", 120, 240),
            ("Payment declined for valid enterprise corporate card", "Payment Failure", "CRITICAL", "Payments", "Marcus Chen", 12, 30),
        ]

        ticket_count = 1001
        for subj, cat, prio, dept_n, agent_n, age_m, res_m in ticket_templates:
            t_num = f"TCK-{ticket_count}"
            ticket_count += 1
            if ticket_count == 1048:
                ticket_count += 1  # Skip 1048 as it is created specifically

            existing = db.query(Ticket).filter(Ticket.ticket_number == t_num).first()
            if not existing:
                t_created = now - timedelta(minutes=age_m)
                t_deadline = t_created + timedelta(minutes=res_m)
                t_agent = agent_map.get(agent_n)
                t_policy = sla_map.get(prio, sla_map["MEDIUM"])

                # Determine status
                if age_m >= res_m:
                    t_status = "RESOLVED" if random.random() < 0.5 else "OPEN"
                elif prio == "CRITICAL" and age_m >= 15:
                    t_status = "ESCALATED"
                else:
                    t_status = "IN_PROGRESS" if t_agent else "OPEN"

                new_ticket = Ticket(
                    ticket_number=t_num,
                    customer_id=random.choice(cust_list).id,
                    department_id=dept_map[dept_n].id,
                    department_name=dept_n,
                    sla_policy_id=t_policy.id,
                    subject=subj,
                    description=f"{subj}. Customer reported during routine operations. Please investigate.",
                    category=cat,
                    urgency=prio,
                    priority=prio,
                    status=t_status,
                    channel="WEB",
                    assigned_agent_id=t_agent.id if t_agent else None,
                    created_at=t_created,
                    updated_at=now,
                    sla_deadline=t_deadline,
                    first_response_deadline=t_created + timedelta(minutes=t_policy.first_response_minutes),
                )
                db.add(new_ticket)
                db.flush()

                # Add SLA prediction
                prob = min(0.95, max(0.08, (age_m / res_m) * 0.7 + (0.3 if prio == "CRITICAL" else 0.0)))
                r_level = "CRITICAL" if prob >= 0.75 else ("HIGH" if prob >= 0.50 else "MEDIUM")
                pred = SLAPrediction(
                    ticket_id=new_ticket.id,
                    breach_probability=round(prob, 2),
                    risk_level=r_level,
                    predicted_breach_time_minutes=max(0.0, (t_deadline - now).total_seconds() / 60.0),
                    confidence=0.88,
                    queue_depth_at_prediction=20,
                    department_queue_depth=8,
                    agent_utilization_at_prediction=t_agent.utilization if t_agent else 0.5,
                    sla_consumed_percent=round((age_m / res_m) * 100, 1),
                    remaining_sla_minutes=max(0.0, (t_deadline - now).total_seconds() / 60.0),
                    contributing_factors=[f"SLA consumption at {(age_m / res_m) * 100:.0f}%", f"Priority: {prio}"],
                    model_version="xgb-sla-v1.0",
                )
                db.add(pred)

        # -------------------------------------------------------------
        # Seed Incidents
        # -------------------------------------------------------------
        print("Seeding Incidents...")
        inc = db.query(Incident).filter(Incident.incident_number == "INC-2026-001").first()
        if not inc:
            inc = Incident(
                incident_number="INC-2026-001",
                title="Checkout Gateway Latency & Queue Overload",
                severity="CRITICAL",
                department_id=dept_map["Payments"].id,
                trigger="QUEUE_OVERLOAD",
                status="INVESTIGATING",
                current_state={"queue_depth": 24, "utilization": 0.92, "critical_tickets": 4},
                detected_at=now - timedelta(minutes=25),
            )
            db.add(inc)
            db.flush()

            act1 = IncidentAction(
                incident_id=inc.id,
                action_type="PRIORITIZE_CRITICAL",
                description="Fast-track all Critical priority payment tickets to senior specialists",
                priority=1,
                status="APPROVED",
                approved_by="Incident Commander",
            )
            act2 = IncidentAction(
                incident_id=inc.id,
                action_type="ROUTE_OVERFLOW",
                description="Enable overflow routing to Account Support for initial customer contact",
                priority=2,
                status="RECOMMENDED",
            )
            db.add(act1)
            db.add(act2)

        db.commit()
        print("Database seeded successfully with all required demonstration records!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
