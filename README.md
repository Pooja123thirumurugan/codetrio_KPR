# SLA Guardian AI

> **"Predict. Prevent. Optimize. Resolve."**  
> **Problem Statement**: HTH-SA-10 — SLA-Aware Automated Support Ticket Routing & Escalation System  
> **Current Stage**: **PHASE 1 — FRONTEND EVALUATION ONLY**  

---

## Overview

SLA Guardian AI is an enterprise support operations platform engineered to shift customer support from reactive post-breach firefighting to **proactive, pre-breach predictive prevention**.

For detailed documentation, architectural specs, and evaluation evidence, see:
👉 **[Phase 1 Frontend Documentation](docs/PHASE_1_FRONTEND.md)**

---

## Quick Start (Frontend Standalone)

```bash
# 1. Install dependencies
npm --prefix frontend install

# 2. Run the development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Build & Verify
```bash
npm run build
```

---

## 14 Implemented Routes & Multi-Role Experiences

### Perspectives & Roles
- 🛡️ **Admin / Operations Lead**: Global crisis tracking, predictive breach radar, incident commander, digital twin, simulator.
- 🎧 **Support Agent (Priya Sharma)**: Direct L3 payment queue, workload gauge, 1-click AI Copilot resolution.
- 👤 **Customer (Acme Corp)**: Submit support tickets, track live SLA countdown timers, verify contract compliance.

### Route Index
- `/dashboard` — Executive Command Center & crisis monitoring
- `/portal` — Customer Support Portal & Ticket Submission
- `/workbench` — Support Agent Workbench (Priya Sharma)
- `/tickets` — 50+ enterprise tickets with multi-filter search & "+ Raise Ticket"
- `/tickets/:id` — Deep-dive inspection with SLA Countdown, Breach Predictor & AI Copilot
- `/agents` — 12-agent workforce roster & capacity load meters
- `/sla-risk` — Predictive SLA breach radar & triage
- `/escalations` — Preventive (pre-breach) vs Post-Breach escalations
- `/incident-commander` — SEV-1 payment crisis mitigation center
- `/simulator` — What-if stress testing with 6 presets & 4 sliders
- `/digital-twin` — Support operations digital twin comparison
- `/analytics` — SLA compliance & operational intelligence
- `/demo` — Interactive 7-phase evaluation tour
- `/settings` — Calibration thresholds & mock data reset

---

## Phase 1 Boundary Statement
Backend services (FastAPI, Python services, PostgreSQL, SQLAlchemy, Alembic, XGBoost, and real Gemini API) are intentionally excluded from Phase 1 and will be delivered in Phase 2.
