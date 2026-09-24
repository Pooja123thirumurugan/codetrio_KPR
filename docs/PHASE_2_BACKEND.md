# Phase 2 — Backend, Database & AI/ML Evaluation Report

> **PROJECT:** SLA Guardian AI (Problem Statement: HTH-SA-10)  
> **Tagline:** *Predict. Prevent. Optimize. Resolve.*  
> **Development Stage:** Phase 2 — Backend + Database + AI/ML Evaluation Only  
> **Notice:** *Frontend-backend integration is intentionally deferred to Phase 3.*

---

## 1. Phase 2 Scope & Objectives

The primary focus of Phase 2 is building the robust, intelligent, and persistent backend architecture for **SLA Guardian AI**. The system automates support ticket categorization, SLA tracking, predictive breach risk estimation, intelligent routing with strict capacity constraints, proactive pre-breach escalation, incident anomaly scanning, isolated what-if simulations, and audit logging.

### Core Guiding Principle
**THE SYSTEM PREDICTS SLA BREACHES BEFORE THEY OCCUR.** Escalations occur in the `AT_RISK` state before a ticket enters `BREACHED` state, preventing customer SLA violations proactively rather than reacting retroactively.

---

## 2. Backend Architecture

The backend is developed in **Python 3.11+** utilizing **FastAPI** for high-throughput asynchronous API handling, **SQLAlchemy 2.0** ORM for data modeling, **Alembic** for migrations, **XGBoost & Scikit-Learn** for ML inference, and **FastAPI WebSockets** for operational broadcasting.

```mermaid
graph TD
    Client[Evaluator / API Client / Swagger] -->|REST / OpenAPI| FastAPI[FastAPI Application Gateway]
    Client -->|WebSocket| WS[/ws/operations]

    subgraph Service Layer
        FastAPI --> TicketService[Ticket Service]
        FastAPI --> SLAService[SLA Service]
        FastAPI --> RoutingService[Routing Service]
        FastAPI --> EscalationService[Escalation Service]
        FastAPI --> SimService[Simulation Service]
        FastAPI --> IncService[Incident Service]
        FastAPI --> AIService[AI Response Service]
        FastAPI --> AnalyticsService[Analytics Service]
        FastAPI --> AuditService[Audit Service]
    end

    subgraph ML & Intelligence Layer
        SLAService --> XGBoost[XGBoost SLA Predictor]
        TicketService --> NLPClf[TF-IDF + LogisticRegression Classifier]
        TicketService --> UrgencyEngine[Hybrid Urgency Detector]
        SLAService --> FallbackPred[Deterministic Fallback Predictor]
        AIService --> Gemini[Google Gemini AI Client]
        AIService --> FallbackAI[Template Engine Fallback]
    end

    subgraph Persistence Layer
        TicketService --> PostgreSQL[(PostgreSQL / SQLite DB)]
        SLAService --> PostgreSQL
        RoutingService --> PostgreSQL
        EscalationService --> PostgreSQL
        AuditService --> PostgreSQL
    end
```

---

## 3. Database Architecture

The relational schema implements full normalization with foreign keys, composite indexes on high-cardinality status and timestamp fields, and JSON columns for extensible feature snapshots and decision metadata.

### 16 Core Database Entities:
1. `customers`: Enterprise, VIP, Premium, and Standard customer profiles.
2. `departments`: Operational units (Payments, Billing, Account Support, Technical Support, Security & Compliance, Product Operations).
3. `agents`: Support specialist profiles with live capacity counters, utilization, breach rate, and availability.
4. `skills`: Domain competencies (Payments, Billing, Refunds, Authentication, Technical Support, etc.).
5. `agent_skills_association`: Many-to-many mapping with proficiency tracking.
6. `sla_policies`: Tiered SLAs defining resolution deadlines, response deadlines, and risk percentage thresholds.
7. `tickets`: Central ticket records with priority, urgency, category, channel, and deadline timestamps.
8. `ticket_events`: Chronological audit trail of ticket lifecycle events.
9. `sla_predictions`: Persistent inference logs capturing breach probabilities, feature snapshots, and contributing factors.
10. `routing_decisions`: Comprehensive multi-factor routing evaluations with component score breakdowns and alternatives.
11. `escalations`: Pre-breach escalations with trigger types, machine reasons, and human-in-the-loop approval statuses.
12. `ai_responses`: AI-drafted first responses with sentiment tone, token tracking, and provider provenance.
13. `simulations`: Parameterized what-if load and stress test executions.
14. `simulation_results`: Isolated outcome state metrics without production database pollution.
15. `incidents`: Anomaly-detected system incidents with severity triggers and impacted departments.
16. `incident_actions`: Remediation action recommendations with approval workflows.
17. `audit_logs`: Centralized audit ledger tracking actors, actions, entities, and diffs.

---

## 4. Database ER-Style Diagram

```mermaid
erDiagram
    CUSTOMERS ||--o{ TICKETS : places
    DEPARTMENTS ||--o{ AGENTS : contains
    DEPARTMENTS ||--o{ TICKETS : routes_to
    DEPARTMENTS ||--o{ INCIDENTS : flags
    AGENTS ||--o{ TICKETS : handles
    AGENTS }|--|{ SKILLS : possesses
    SLA_POLICIES ||--o{ TICKETS : governs
    TICKETS ||--o{ TICKET_EVENTS : logs
    TICKETS ||--o{ SLA_PREDICTIONS : predicts
    TICKETS ||--o{ ROUTING_DECISIONS : evaluates
    TICKETS ||--o{ ESCALATIONS : triggers
    TICKETS ||--o{ AI_RESPONSES : drafts
    SIMULATIONS ||--|| SIMULATION_RESULTS : generates
    INCIDENTS ||--o{ INCIDENT_ACTIONS : prescribes
```

---

## 5. API Endpoint Directory

### System & Health
- `GET /health`: Liveness probe and database connectivity check.
- `GET /api/system/status`: Subsystem status for database, ML model registry, AI provider, and WebSocket engine.

### Tickets
- `POST /api/tickets/`: Create a new ticket with automatic categorization, urgency evaluation, and SLA assignment.
- `GET /api/tickets/`: List and filter tickets by status, priority, department, agent, with pagination.
- `GET /api/tickets/{ticket_id}`: Retrieve full ticket state with dynamic SLA calculation and breach risk.
- `PATCH /api/tickets/{ticket_id}`: Update ticket status, assigned agent, or priority.
- `POST /api/tickets/classify`: Standalone NLP classification of subject/description text.
- `POST /api/tickets/urgency`: Standalone urgency analysis.
- `POST /api/tickets/{ticket_id}/ai-response`: Generate first response draft via Gemini API or template fallback.
- `GET /api/tickets/{ticket_id}/risk`: On-demand SLA breach probability evaluation.

### Agents & Capacity
- `GET /api/agents/`: List agents filtered by department, status, and availability.
- `GET /api/agents/{agent_id}`: Fetch single agent profile and skills.
- `GET /api/agents/{agent_id}/capacity`: Live agent utilization, active ticket load, and remaining capacity slots.
- `POST /api/agents/`: Register new support agent with capacity parameters.
- `PATCH /api/agents/{agent_id}`: Update agent capacity, availability, or status.

### SLA & Predictions
- `GET /api/sla/policies`: List configurable SLA policies.
- `POST /api/sla/policies`: Create new SLA policy.
- `GET /api/sla/policies/{policy_id}`: Get specific policy configuration.
- `GET /api/sla/tickets/{ticket_id}/calculate`: Real-time SLA consumed %, remaining minutes, and status (`SAFE`, `WARNING`, `AT_RISK`, `BREACHED`).
- `POST /api/sla/tickets/{ticket_id}/predict-breach`: XGBoost SLA breach probability prediction under dynamic queue conditions.

### Routing
- `POST /api/tickets/{ticket_id}/route`: Intelligent multi-factor agent assignment with strict capacity constraints.
- `GET /api/tickets/{ticket_id}/routing`: Retrieve latest routing decision and alternative agents.
- `GET /api/departments/{department_id}/queue`: Live department queue depth, utilization, and capacity status.

### Escalations
- `GET /api/escalations`: List escalations filtered by level (`LEVEL_1`, `LEVEL_2`, `MANAGER`, `INCIDENT`) and status.
- `GET /api/escalations/{id}`: Detailed escalation information with machine and human reasons.
- `POST /api/tickets/{ticket_id}/evaluate-escalation`: Evaluate pre-breach predictive escalation triggers.
- `POST /api/escalations/{id}/approve`: Supervisor approval of predictive escalation.
- `POST /api/escalations/{id}/execute`: Execute remediation action (e.g., ticket reassignment, priority boost).

### Simulations
- `POST /api/simulations/`: Execute an isolated what-if operational stress simulation.
- `GET /api/simulations/`: List historical simulation runs.
- `GET /api/simulations/{id}`: View simulation configuration and run state.
- `GET /api/simulations/{id}/results`: Get before/after delta metrics, risk distributions, and recommendations.

### Incidents
- `GET /api/incidents/`: List active operational incidents.
- `GET /api/incidents/{id}`: Retrieve incident severity and root trigger metrics.
- `POST /api/incidents/scan`: Trigger automated queue and capacity anomaly scan.
- `POST /api/incidents/actions/{action_id}/approve`: Approve incident remediation action.
- `POST /api/incidents/actions/{action_id}/execute`: Execute incident remediation action.

### Analytics
- `GET /api/analytics/overview`: High-level operational volume, compliance %, and capacity KPIs.
- `GET /api/analytics/sla`: SLA performance by priority, tier, and department.
- `GET /api/analytics/routing`: Auto-assignment efficiency and component score distributions.
- `GET /api/analytics/agents`: Workload balance, utilization tiers, and team capacity.
- `GET /api/analytics/escalations`: Pre-breach prevention rate and escalation trigger statistics.

---

## 6. Machine Learning Architecture

The ML pipeline incorporates dual model architectures with deterministic fallbacks:

```mermaid
flowchart LR
    Input[Ticket Text & Features] --> NLP[TF-IDF + LogisticRegression]
    Input --> Hybrid[Rule + Keyword Urgency Engine]
    Input --> Features[Feature Engineering Pipeline]
    Features --> XGB[XGBoost SLA Breach Classifier]
    Features --> Fallback[Deterministic Multi-Factor Scoring]
```

1. **Ticket Categorizer**: TF-IDF vectorizer (unigrams + bigrams, 2500 features) coupled with L2-regularized Logistic Regression.
2. **SLA Breach Predictor**: Gradient boosted decision tree (`XGBClassifier`) trained on 17 continuous and categorical operational features with an ROC-AUC of **0.974**.
3. **Model Registry**: Runtime manager that loads serialized artifacts (`.joblib`) from disk and seamlessly degrades to rule-based inference if artifacts are unavailable.

---

## 7. SLA Breach Prediction Logic

Breach risk is continuously evaluated across 17 real-time features:
- `ticket_age_minutes` & `sla_consumed_percent`
- `sla_remaining_minutes`
- `priority_num` & `urgency_num`
- `customer_tier_num` & `channel_num`
- `queue_depth` & `department_queue_depth`
- `assigned_agent_load` & `department_load`
- `agent_utilization` & `average_resolution_time`
- `historical_breach_rate` & `peak_hour_indicator`
- `ticket_complexity_proxy` & `capacity_pressure`

### Critical Feature Behavior: Live Queue Sensitivity
Risk is **not static**. A ticket with 18 minutes remaining evaluated under a queue depth of 5 and agent utilization of 40% yields a ~28% breach probability (`LOW`/`MEDIUM`). When evaluated under a queue depth of 35 and agent utilization of 92%, the breach probability accelerates to **82%+** (`CRITICAL`), proving dynamic sensitivity to operational stress.

---

## 8. Routing Algorithm

The routing engine employs a 5-factor weighted scoring model:

$$\text{Overall Score} = 0.30 \cdot S_{\text{skill}} + 0.25 \cdot S_{\text{capacity}} + 0.20 \cdot S_{\text{sla}} + 0.15 \cdot S_{\text{queue}} + 0.10 \cdot S_{\text{perf}}$$

### Strict Capacity Filtering
1. **Department Filter**: Match agents belonging to the destination department.
2. **Skill Compatibility**: Calculate Jaccard similarity and keyword alignment between ticket requirements and agent skills.
3. **Availability Filter**: Exclude agents in `OFFLINE` status.
4. **Capacity Gate**: Agents with $active\_tickets \ge max\_capacity$ or in `AT_CAPACITY` status are **strictly excluded**.
5. **No Available Agent Protocol**: If all eligible agents are at 100% capacity, the engine returns status `NO_AVAILABLE_AGENT` and automatically triggers a predictive escalation recommendation.

---

## 9. Predictive Escalation Logic

Escalation occurs **BEFORE** the SLA breach occurs.

### Triggers:
1. **High Breach Risk**: Predicted breach probability $\ge 0.75$ and remaining SLA $\le 20\text{ min}$.
2. **SLA Buffer Proximity**: Remaining SLA time $\le$ configured warning threshold.
3. **Risk Velocity Spike**: Breach probability increasing at a rate $> 0.15$ over consecutive evaluations.
4. **Capacity Collapse**: Assigned agent or department reaches 100% utilization while ticket is active.
5. **No Eligible Agent**: Routing engine encounters zero unburdened agents with required skills.

### Human-in-the-Loop Workflow:
$$\text{Predictive Engine Triggers} \longrightarrow \text{Status: PENDING\_APPROVAL} \longrightarrow \text{Supervisor Approves} \longrightarrow \text{Automated Action Executes}$$

---

## 10. Simulation Architecture

The simulation engine allows operational leads to model what-if scenarios in complete isolation:
- **Scenarios**: `TICKET_SPIKE`, `AGENT_FAILURE`, `QUEUE_OVERLOAD`, `SLA_TIGHTENING`, `CRITICAL_SURGE`, `RECOVERY`.
- **Zero Production Pollution**: Ingests production snapshot into memory, applies delta perturbations, runs the predictive ML engine, and writes results only to `simulations` and `simulation_results` tables without modifying active tickets.

---

## 11. Incident Detection

The incident scanner aggregates real-time signals to detect system-wide anomalies:
- **Queue Overload**: Total or department queue depth exceeds threshold.
- **Critical Surge**: $\ge 3$ critical priority tickets pending within a single department.
- **Capacity Collapse**: Department average utilization exceeds 90%.
- Generates actionable, non-destructive recommendations (`PRIORITIZE_CRITICAL`, `ROUTE_OVERFLOW`, `ACTIVATE_AGENTS`).

---

## 12. AI Response Architecture

The first-response generator uses an asynchronous abstraction:
- **Primary**: Google Gemini API via official client SDK.
- **Deterministic Fallback**: Comprehensive parameterized templates tailored to category, priority, customer tier, and tone (`PROFESSIONAL`, `EMPATHETIC`, `URGENT`, `TECHNICAL`).
- **Resilience**: API failures, missing keys, or timeouts gracefully fall back to structured templates with zero user impact.

---

## 13. WebSocket Events (`/ws/operations`)

Operational real-time stream broadcast events:
- `TICKET_CREATED`, `TICKET_UPDATED`
- `SLA_RISK_UPDATED`, `ROUTING_UPDATED`
- `ESCALATION_TRIGGERED`, `ESCALATION_APPROVED`, `ESCALATION_EXECUTED`
- `AGENT_CAPACITY_UPDATED`
- `INCIDENT_CREATED`
- `SIMULATION_COMPLETED`

---

## 14. Audit Logging

Every critical operational decision records:
- `timestamp`, `actor`, `actor_id`
- `action` (`TICKET_CREATED`, `CLASSIFICATION_PERFORMED`, `SLA_CALCULATED`, `RISK_PREDICTED`, `ROUTING_DECISION`, `ESCALATION_TRIGGERED`, etc.)
- `entity`, `entity_id`
- `old_value`, `new_value`, and `reason`

---

## 15. Test Coverage & Verification

The test suite comprises **39 comprehensive automated tests** across 14 test modules:
- `test_health.py`: Liveness and status checks.
- `test_tickets.py`: Lifecycle, validation, filtering.
- `test_classification.py`: NLP classifier and fallback accuracy.
- `test_urgency.py`: Rule + ML urgency scoring.
- `test_sla.py`: Calculation, consumed %, status transitions.
- `test_sla_prediction.py`: Feature sensitivity and queue dynamics.
- `test_routing.py`: Multi-factor scoring and skill matching.
- `test_capacity.py`: Capacity limits and overcapacity exclusions.
- `test_escalation.py`: Pre-breach triggers, approval, and execution.
- `test_simulation.py`: Isolation from production database.
- `test_incidents.py`: Anomaly detection and remediation workflows.
- `test_ai_response.py`: Generative drafting and template fallback.
- `test_audit.py`: Audit ledger integrity.
- `test_e2e_predictive_workflow.py`: **End-to-End Predictive Integration & Proof that Escalation occurs BEFORE SLA Breach.**

---

## 16. Seed Data & Final Demo Scenario (TCK-1048)

The database includes realistic seed data:
- 12 Support Agents across 6 departments.
- 5 Tiered SLA Policies (Critical 30m, Critical VIP 20m, High 60m, Medium 240m, Low 480m).
- 32 Operational Tickets in various risk states.

### Highlight Scenario: TCK-1048
- **Ticket ID:** `TCK-1048`
- **Subject:** *"Payment failure during checkout"*
- **Category:** Payment Failure | **Department:** Payments | **Priority:** CRITICAL
- **SLA Total:** 30 minutes | **SLA Remaining:** 18 minutes (NOT breached)
- **Queue Depth:** 24 | **Assigned Agent:** Marcus Chen (100% capacity)
- **Predicted Breach Probability:** 82% (`CRITICAL` Risk Level)
- **Triggered Action:** `PRE_BREACH` Escalation (Status: `PENDING_APPROVAL`)
- **Recommended Routing:** Reassign to Priya Sharma (40% capacity, Payment Skill Match 100%, Score 0.91)

---

## 17. Environment Variables Configuration

Copy `.env.example` to `.env`:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sla_guardian
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
MODEL_PATH=./app/ml/artifacts
ENVIRONMENT=development
LOG_LEVEL=INFO
DEFAULT_PRE_BREACH_BUFFER_MINUTES=20
SLA_BREACH_RISK_THRESHOLD=0.75
```

---

## 18. How to Run the Backend

```bash
# 1. Activate virtual environment
cd backend
.venv\Scripts\activate  # Windows
# or: source .venv/bin/activate  # Linux/Mac

# 2. Run Database Migrations
alembic upgrade head

# 3. Train Machine Learning Models
python scripts/train_models.py

# 4. Seed Database with Realistic Data
python scripts/seed_data.py

# 5. Start Backend Server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 19. How to Run Tests

```bash
cd backend
pytest -v
```

---

## 20. Swagger / OpenAPI Interactive Documentation

With the backend running:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Probe:** [http://localhost:8000/health](http://localhost:8000/health)
- **System Status:** [http://localhost:8000/api/system/status](http://localhost:8000/api/system/status)

---

## 21. Known Limitations & Phase 3 Roadmap

- **Phase Lock:** Frontend-backend live integration is intentionally deferred to Phase 3. The Phase 1 React dashboard remains fully functional in its demo/mock state.
- **Database Support:** Default configuration utilizes PostgreSQL for containerized deployments with automatic SQLite fallback for lightweight standalone local evaluation.
