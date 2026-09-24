# SLA Guardian AI — Full System Integration

> **"Predict. Prevent. Optimize. Resolve."**  
> **Problem Statement**: HTH-SA-10 — SLA-Aware Automated Support Ticket Routing & Escalation System  
> **Development Stage**: **PHASE 3 — FULL SYSTEM INTEGRATION + FINAL EVALUATION**  

---

## Executive Overview

**SLA Guardian AI** is an intelligent, automated support operations platform engineered to solve the critical flaw of traditional ticketing systems: **reacting only after an SLA breach has already occurred**.

By combining real-time queue telemetry, live agent capacity meters, NLP text classification, and an **XGBoost Machine Learning model**, SLA Guardian AI **predicts SLA breaches while sufficient time remains** (e.g., at 18 minutes remaining with an 82% risk score) and triggers **predictive pre-breach escalations** with human-in-the-loop approval workflows.

---

## Full System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 SPA Frontend                           │
│  Executive Dashboard • Agent Workbench • SLA Risk Radar • Incidents   │
└──────────────────┬─────────────────────────────────▲───────────────────┘
                   │ REST API (JSON)                 │ WebSocket Stream
                   ▼                                 │ (/ws/operations)
┌────────────────────────────────────────────────────┴───────────────────┐
│                    FastAPI Backend Gateway (:8000)                     │
│  Ticket Lifecycle • SLA Engine • Multi-Factor Routing • Escalations   │
└─────────┬──────────────────────┬──────────────────────┬────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  PostgreSQL 15   │   │  XGBoost ML /    │   │  Google Gemini   │
│ Database Schema  │   │  Fallback Risk   │   │ Generative AI    │
│  (Alembic ORM)   │   │ Predictor (Joblib│   │ Response Copilot │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## Key Capabilities & Highlights

1. **Predictive Pre-Breach Escalation (Core Problem Statement):**
   - Automatically escalates tickets *before* they breach their SLA deadline.
   - Scenario demonstration: **TCK-1048** (Critical Payment Outage) triggers preventive escalation at **18 minutes remaining** under **82% risk**.
2. **Intelligent Multi-Factor Routing:**
   - Routes incoming tickets by skill match (35%), capacity availability (30%), historical SLA reliability (20%), and resolution speed (15%).
   - Strict capacity guards prevent overloading agents at $\ge 100\%$ utilization.
3. **Live Agent Capacity Tracking:**
   - Real-time utilization gauges dynamically update as tickets are assigned or resolved.
4. **Isolated What-If Simulation Engine & Digital Twin:**
   - Stress test operations with $+50$ ticket surges or agent dropouts without mutating production database tables.
5. **Incident Commander:**
   - Detects queue anomalies, correlates outage clusters, and provides 1-click mitigation playbooks with human sign-off.
6. **AI Response Copilot:**
   - Generates contextual customer response drafts using Google Gemini (with seamless deterministic fallback).
7. **Complete Audit Timeline:**
   - Full chronological decision record (creation, classification, risk prediction, routing, human approval, execution).

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS / Lucide Icons, Vite 8, WebSocket Client.
- **Backend:** FastAPI, Python 3.10+, Pydantic v2, Uvicorn, Asyncio.
- **Database & Migration:** PostgreSQL 15, SQLAlchemy 2.0 ORM, Alembic (with SQLite standalone fallback).
- **Machine Learning:** XGBoost (`XGBClassifier`), Scikit-Learn, Joblib, Custom Feature Engineering Pipeline (17 features).
- **Generative AI:** Google Gemini API (`gemini-2.5-flash`) with structured template fallback engine.
- **Real-Time Layer:** FastAPI WebSocket Connection Manager (`/ws/operations`).
- **Containerization:** Docker, Docker Compose (Multi-stage Node & Nginx builds).

---

## Environment Variables

### Backend (`backend/.env`)
```ini
ENVIRONMENT=production
LOG_LEVEL=INFO
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sla_guardian
# For SQLite local dev: sqlite:///./sla_guardian.db
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:80,http://localhost
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/operations
```

---

## Quick Start Guide

### Option A: Docker Compose (Full Stack — Recommended)

Launch Frontend, Backend, and PostgreSQL database with a single command:

```bash
docker compose up --build
```

- **Frontend Application:** `http://localhost:3000` (or `http://localhost:80`)
- **Backend API & Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

To tear down:
```bash
docker compose down
```

---

### Option B: Local Manual Setup

#### 1. Backend Setup & Startup
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate      # Windows (or source .venv/bin/activate on Linux/Mac)

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
alembic upgrade head
python scripts/train_models.py
python scripts/seed_data.py

# Launch FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup & Startup
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## Running the Automated Test Suite

### Backend Unit & Full Integration Tests (Pytest)
```bash
cd backend
.\.venv\Scripts\python.exe -m pytest -v
```
*Result: **43 passed** in under 3 seconds.*

Key test suites:
- `test_phase3_full_integration.py` — End-to-end full system lifecycle, pre-breach escalation proof, simulation DB isolation guarantee, and AI copilot resilience.
- `test_routing.py` — Multi-factor scoring, capacity constraint enforcement, and offline agent exclusion.
- `test_sla_prediction.py` — XGBoost model inference and queue pressure sensitivity.
- `test_escalation.py` — Predictive escalation and supervisor approval workflows.

### Frontend Production Build Validation
```bash
cd frontend
npm run build
```
*Result: Verified **0 TypeScript errors**, optimized production bundle generated.*

---

## Interactive Swagger Documentation

Access the interactive OpenAPI / Swagger API explorer at:
👉 **`http://localhost:8000/docs`**

Endpoints include:
- `POST /api/tickets/` — Ticket creation with automated classification and SLA evaluation.
- `POST /api/tickets/{id}/route` — Intelligent routing with agent assignment.
- `POST /api/sla/tickets/{id}/predict-breach` — Live XGBoost risk prediction under dynamic queue load.
- `POST /api/tickets/{id}/evaluate-escalation` — Predictive pre-breach escalation evaluation.
- `POST /api/simulations/` — Zero-mutation what-if queue stress simulation.
- `POST /api/tickets/{id}/ai-response` — AI first-response generator.

---

## 3-to-5 Minute Evaluator Demo Walkthrough

| Step | Page / Action | What to Observe |
| :--- | :--- | :--- |
| **1. Baseline State** | `/dashboard` | Command center shows active tickets, healthy queue, and agent loads. |
| **2. Critical Ticket Creation** | `/tickets` $\rightarrow$ *+ Raise Ticket* | Subject: *"Payment failure during checkout"*. System automatically classifies as `Payment Failure` (Priority: `CRITICAL`, SLA: `30m`). |
| **3. Intelligent Routing** | `/tickets/:id` | View recommended agent (Priya Sharma) based on 95% skill match and capacity availability. |
| **4. Queue Stress & Risk Surge** | `/sla-risk` | Simulate queue surge. Breach probability climbs to **82%** with **18 minutes remaining**. |
| **5. Pre-Breach Escalation** | `/escalations` | System triggers **PREVENTIVE ESCALATION** *before* breach. Supervisor clicks *Approve* & *Execute*. |
| **6. Incident Commander** | `/incident-commander` | View detected queue burst and execute automated rebalancing playbook. |
| **7. What-If Simulator** | `/simulator` & `/digital-twin` | Run `+50 Ticket Surge` simulation; verify production database remains completely untouched. |
| **8. AI Copilot & Audit Trail** | `/tickets/:id` | Generate generative response draft with tone control and review the complete chronological audit timeline. |

---

## Documentation Index

- 📘 **[Phase 3 Full Integration Guide](docs/PHASE_3_INTEGRATION.md)** — Architectural specification, WebSocket protocols, database mappings, and fallback matrices.
- 📙 **[Phase 1 Frontend Guide](docs/PHASE_1_FRONTEND.md)** — Component hierarchy, routes, and UI design tokens.

---

## License
MIT License © 2026 SLA Guardian AI Team.
