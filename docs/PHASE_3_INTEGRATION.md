# SLA GUARDIAN AI — Phase 3 Full System Integration Guide

> **Problem Statement:** HTH-SA-10 — SLA-Aware Automated Support Ticket Routing & Escalation System  
> **Tagline:** *Predict. Prevent. Optimize. Resolve.*  
> **Core Architectural Paradigm:** **PREDICTIVE PRE-BREACH INTERVENTION** (Detecting risk & escalating *before* the SLA breach occurs).

---

## 1. Integration Architecture

SLA Guardian AI operates as an end-to-end distributed system connecting a modern React 19 SPA frontend, a high-throughput FastAPI backend, an XGBoost ML inference pipeline, a PostgreSQL relational database with Alembic schema management, and a bi-directional WebSocket event broadcast layer.

```mermaid
graph TD
    A[React 19 Frontend SPA] <-->|REST API / JSON| B[FastAPI Gateway :8000]
    A <-->|WebSocket Stream /ws/operations| B
    B --> C[PostgreSQL Database :5432]
    B --> D[XGBoost ML Breach Predictor]
    B --> E[Intelligent Multi-Factor Routing Engine]
    B --> F[Predictive Pre-Breach Escalation Engine]
    B --> G[Isolated What-If Simulation Engine]
    B --> H[Google Gemini Generative AI Copilot]
```

---

## 2. Frontend-Backend Connection

The React frontend utilizes an adapter layer (`UnifiedServiceAdapter` in `frontend/src/services/demoAdapter.ts` and `RemoteRestApiAdapter` in `frontend/src/services/api.ts`).

- **Live Auto-Discovery:** On boot, the frontend queries `GET /api/system/status`. If reachable, all views transition to **LIVE DATA** mode.
- **Fail-Safe Fallback:** If the backend is unreachable or offline, the UI smoothly falls back to local demo state while clearly displaying a `FALLBACK / DEMO MODE` banner in the UI header.
- **Base URL Configuration:** Driven by `VITE_API_BASE_URL` (default: `http://localhost:8000/api`) and `VITE_WS_URL` (default: `ws://localhost:8000/ws/operations`).

---

## 3. API Integration

Every frontend page is mapped to type-safe FastAPI REST endpoints matching backend Pydantic schemas:

| Frontend View | Backend REST Endpoint | Primary Function |
| :--- | :--- | :--- |
| **Dashboard** (`/dashboard`) | `GET /api/analytics/kpis`, `GET /api/tickets/` | Queue depth, at-risk count, agent load, active escalations |
| **Tickets List** (`/tickets`) | `GET /api/tickets/`, `POST /api/tickets/` | Ticket CRUD, live filters, SLA status, department tags |
| **Ticket Details** (`/tickets/:id`)| `GET /api/tickets/{id}`, `GET /api/tickets/{id}/audit-logs` | Dynamic SLA timer, feature snapshot, audit timeline |
| **Agents Capacity** (`/agents`) | `GET /api/agents/`, `GET /api/agents/capacity` | Real-time utilization bars, active counts, skill sets |
| **SLA Risk Center** (`/sla-risk`) | `GET /api/sla/policies`, `POST /api/sla/tickets/{id}/predict-breach` | XGBoost risk score, factor breakdown, risk velocity |
| **Escalations** (`/escalations`)| `GET /api/escalations/`, `POST /api/escalations/{id}/approve` | Human-in-the-loop review, approve & execute |
| **Incident Commander** (`/incident-commander`)| `GET /api/incidents/`, `POST /api/incidents/{id}/actions/{action_id}/execute` | Outage detection, queue surge alerts, mass rerouting |
| **What-If Simulator** (`/simulator`)| `POST /api/simulations/` | In-memory queue stress simulations without DB mutation |
| **Digital Twin** (`/digital-twin`)| `POST /api/simulations/` (comparison mode) | Side-by-side delta visualization (Production vs Simulated) |
| **Analytics** (`/analytics`) | `GET /api/analytics/kpis` | SLA compliance rates, department loads, MTTD / MTTR |
| **AI Copilot** (Modal/Drawer) | `POST /api/tickets/{id}/ai-response` | Gemini LLM auto-draft with deterministic template fallback |

---

## 4. WebSocket Integration (`/ws/operations`)

The application implements a reactive WebSocket channel (`app/websocket/manager.py` & `frontend/src/services/api.ts`).

### Handled Event Types
- `TICKET_CREATED`: Real-time addition of new tickets to queue.
- `TICKET_UPDATED`: Live status or assignment updates.
- `SLA_RISK_UPDATED`: Live recalculation of risk upon queue or capacity spikes.
- `ROUTING_UPDATED`: Dynamic agent recommendations.
- `AGENT_CAPACITY_UPDATED`: Real-time agent utilization bar shifts.
- `ESCALATION_TRIGGERED`: Instant alert in the Escalations console.
- `INCIDENT_CREATED`: Flashes incident banner in Incident Commander.
- `SIMULATION_COMPLETED`: Real-time completion payload for simulator.

---

## 5. Database Integration

- **Engine:** PostgreSQL 15 (Docker) / SQLite (Standalone dev fallback).
- **Migration Framework:** Alembic (`alembic upgrade head`).
- **ORM:** SQLAlchemy 2.0 with declarative models:
  - `Ticket`, `Customer`, `Department`, `Agent`, `Skill`, `AgentSkill`
  - `SLAPolicy`, `SLAPrediction`, `RoutingDecision`, `Escalation`
  - `Incident`, `IncidentAction`, `Simulation`, `SimulationResult`, `AuditLog`, `TicketEvent`

---

## 6. Machine Learning Integration

- **Model Type:** XGBoost Classifier (`XGBClassifier`) with Scikit-Learn pipeline.
- **Model Artifact:** `backend/app/ml/artifacts/sla_xgboost.joblib`.
- **Feature Extraction:** 17 engineered features (`backend/app/ml/feature_engineering.py`):
  - `ticket_age_minutes`, `sla_consumed_percent`, `sla_remaining_minutes`
  - `priority_num`, `urgency_num`, `customer_tier_num`, `channel_num`
  - `queue_depth`, `department_queue_depth`, `assigned_agent_load`, `agent_utilization`
  - `average_resolution_time`, `historical_breach_rate`, `peak_hour_indicator`, `capacity_pressure`
- **Fallback Engine:** Rule-based weighted composite calculator (`FallbackSLAPredictor`) guaranteeing 100% uptime if the ML model binary is missing.

---

## 7. Dynamic SLA Flow

1. **Policy Selection:** When a ticket is created, `SLAService.select_policy` matches `(Priority, Customer Tier)`.
2. **SLA Calculation:** Computes elapsed time, remaining minutes, consumed %, and status (`SAFE` < 70%, `WARNING` 70-85%, `AT_RISK` > 85% or < 25m left, `BREACHED` >= 100%).
3. **Queue Sensitivity:** Queue depth and capacity pressure directly amplify breach probability calculations.

---

## 8. Intelligent Multi-Factor Routing Flow

1. Ticket requirements are extracted (department, required skills, priority).
2. All agents in the matching department with status != `OFFLINE` are scored.
3. **Strict Capacity Constraint:** Agents at 100% capacity (`active_ticket_count >= max_capacity`) are rejected.
4. **Scoring Function:**
   $$\text{Score} = (\text{Skill Match} \times 0.35) + (\text{Available Capacity} \times 0.30) + (\text{SLA Track Record} \times 0.20) + (\text{Resolution Efficiency} \times 0.15)$$
5. **Failover:** If no agents are available, status `NO_AVAILABLE_AGENT` is returned and an emergency escalation is recommended.

---

## 9. Predictive Pre-Breach Escalation Flow *(Core Problem Statement)*

```mermaid
sequenceDiagram
    participant Ticket as Ticket TCK-1048
    participant Queue as Queue Monitor
    participant ML as XGBoost SLA Predictor
    participant Engine as Escalation Engine
    participant Sup as Supervisor UI

    Note over Ticket: SLA = 30 min, 18 min remaining (NOT Breached)
    Queue ->> ML: Queue spikes to 35 tickets, Agent util = 95%
    ML ->> ML: Predict Breach Risk = 82% (> 75% Threshold)
    ML ->> Engine: Emit High Breach Probability
    Engine ->> Engine: Trigger PRE_BREACH Escalation
    Engine ->> Sup: Push Alert: Preventive Action Needed
    Sup ->> Engine: Approve & Execute Specialist Reassignment
    Engine ->> Ticket: Reassigned to Tier 3 Specialist (Priya Sharma)
    Note over Ticket: Resolved at min 24 (SLA Preserved!)
```

---

## 10. Incident Commander Flow

- **Detection:** Automated anomaly detection scans for queue bursts (`> 15` tickets in one department) or risk clusters (`>= 3` critical tickets at risk).
- **Remediation Actions:** Generates actionable playbooks:
  1. *Reassign non-critical tickets*
  2. *Activate reserve agents*
  3. *Escalate payment tickets to Tier 3*
- **Human Governance:** Evaluators review proposed actions and execute them with persistent audit trails.

---

## 11. What-If Simulation Flow (Zero Production Mutation)

- Runs in-memory queue stress tests via `POST /api/simulations/`.
- Users test scenarios like `+50 Tickets Spike`, `3 Agent Failures`, or `-20% SLA Window`.
- **Isolation Guarantee:** Production `tickets`, `agents`, and `sla_predictions` tables are strictly untouched. Only `Simulation` and `SimulationResult` log rows are created.

---

## 12. AI Response Copilot Flow

- User clicks **Generate AI Response** on Ticket Details.
- Backend invokes Google Gemini API (`gemini-2.5-flash` or configured model) with ticket context, customer tier, and tone instructions.
- If `GEMINI_API_KEY` is unset or quota is exceeded, the service seamlessly delivers a deterministic structured resolution draft with customer salutation, diagnosis, and action steps.

---

## 13. Audit & Event Trail

Every lifecycle state transition is logged in the `AuditLog` table with timestamp, actor (`AGENT`, `SUPERVISOR`, `ML_ENGINE`, `SLA_SERVICE`), action, previous value, new value, and rationale.

---

## 14. Error Handling & Fallback Architecture

| Failure Mode | Fallback Strategy |
| :--- | :--- |
| **Backend Unreachable** | Frontend switches to local demo state with explicit banner |
| **PostgreSQL Offline** | Backend falls back to local SQLite database (`sla_guardian.db`) |
| **XGBoost Artifact Missing** | Deterministic composite risk model takes over automatically |
| **Gemini API Down / No Key** | Contextual template response engine generates structured draft |
| **WebSocket Disconnected** | Automatic exponential reconnect + polling fallback |
| **All Agents at Capacity** | Escalation recommendation triggered with supervisor notification |

---

## 15. Docker Architecture

The entire multi-tier system runs seamlessly with Docker Compose:

```
sla_guardian_frontend  (Nginx Alpine - Port 80 / 3000)
         │
         ▼
sla_guardian_backend   (FastAPI Python 3.10 - Port 8000)
         │
         ▼
sla_guardian_postgres  (PostgreSQL 15 - Port 5432)
```

---

## 16. Test Verification Suite

All 43 backend and integration tests pass with 100% success rate:

```bash
cd backend
.\.venv\Scripts\python.exe -m pytest -v
# Output: 43 passed in 2.75s
```

Frontend production build:
```bash
cd frontend
npm run build
# Output: built in 1.45s with 0 TypeScript errors
```

---

## 17. End-to-End Test Matrix

1. `test_phase3_full_system_lifecycle_e2e`: Validates create -> NLP classify -> SLA calculate -> XGBoost risk -> Intelligent routing -> Capacity increment -> Pre-breach escalation -> Audit logging.
2. `test_phase3_critical_pre_breach_escalation_proof`: **PROVES that escalation occurs when `is_breached == False` and 18 minutes remain.**
3. `test_phase3_simulation_isolation_guarantee`: Proves zero state mutation on production tables.
4. `test_phase3_ai_response_copilot_resilience`: Proves generative & deterministic response delivery.

---

## 18. Evaluator 3-Minute Demo Script

1. **Step 1: Live Overview (`/dashboard`)** — View healthy queue and agent capacity.
2. **Step 2: Inject Critical Outage (`/tickets`)** — Create ticket "Payment gateway 504 timeout during checkout". Verify classification (`Payment Failure`) and SLA (30m).
3. **Step 3: Intelligent Routing (`/tickets/:id`)** — View recommended specialist (e.g. Priya Sharma) with skill match & capacity justification.
4. **Step 4: Queue Stress & Risk Acceleration (`/sla-risk`)** — Simulate queue surge. Watch breach probability climb to **82%** with **18 minutes remaining**.
5. **Step 5: Pre-Breach Escalation (`/escalations`)** — Verify preventive escalation triggers **BEFORE** breach. Approve & execute.
6. **Step 6: Incident Management (`/incident-commander`)** — Open queue overload incident and execute automated agent reassignments.
7. **Step 7: What-If Simulation (`/simulator`)** — Simulate `+50 Tickets Surge` and compare simulated vs production capacity pressure in Digital Twin (`/digital-twin`).
8. **Step 8: AI Copilot & Audit Trail (`/tickets/:id`)** — Generate customer response draft and view full audit timeline.

---

## 19. Environment Variables

### Backend (`backend/.env`)
```ini
ENVIRONMENT=production
LOG_LEVEL=INFO
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/sla_guardian
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:80,http://localhost
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/operations
```

---

## 20. Known Limitations & Future Enhancements

- **Voice/Audio Channel:** Currently supports WEB, EMAIL, CHAT, API, and PHONE metadata. Direct telephony audio streaming integration planned for v2.1.
- **Multi-Tenant Sharding:** PostgreSQL schema supports enterprise customer tiers; cross-region database sharding can be introduced as queue load exceeds 50,000 tickets/sec.
