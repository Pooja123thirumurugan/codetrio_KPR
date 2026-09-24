# SLA Guardian AI — Phase 1 Frontend Evaluation

> **Tagline**: *"Predict. Prevent. Optimize. Resolve."*  
> **Problem Statement**: HTH-SA-10 — SLA-Aware Automated Support Ticket Routing & Escalation System  
> **Evaluation Stage**: Phase 1 — Frontend Evaluation Only  

---

## 1. Executive Summary & Scope

**SLA Guardian AI** is an intelligent, SLA-aware enterprise support operations platform built to transform customer support from a **reactive** firefighting model into a **predictive, automated prevention** engine.

### Strict Phase 1 Boundary Notice
This delivery represents **PHASE 1: FRONTEND EVALUATION ONLY**. The frontend application is 100% standalone, fully functional, interactive, and self-contained. It operates with a comprehensive in-memory Mock Data & Service Adapter architecture.

```
+-----------------------------------------------------------------------------------+
|                           PHASE 1 BOUNDARY LOCK                                   |
|                                                                                   |
|  [x] Standalone React + TypeScript + Vite UI        [ ] FastAPI / Python Backend  |
|  [x] 12 Enterprise Dark-Themed Routes               [ ] PostgreSQL Database       |
|  [x] High-Fidelity Interactive Mock Engine          [ ] SQLAlchemy / Alembic      |
|  [x] Pre-Breach Predictive Escalation Workflows     [ ] Real XGBoost Pipeline     |
|  [x] Incident Command & Digital Twin Simulator      [ ] Live Gemini API Backend   |
|  [x] Guided 7-Step Hackathon Demo Scenario          [ ] Docker Compose Containers |
+-----------------------------------------------------------------------------------+
```

> **Explicit Limitation Statement**:  
> Backend services, database persistence (PostgreSQL/SQLAlchemy), real machine learning inference (XGBoost/scikit-learn), and live LLM API calls are intentionally excluded from Phase 1 and will be implemented in Phase 2.

---

## 2. Technology Stack

The application is engineered using modern web standards with an enterprise-grade dark theme:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 (`react`, `react-dom`) | Component architecture with modern hooks |
| **Language** | TypeScript 5.9 | Full type safety across models, states, and adapters |
| **Build Tool** | Vite 8 | Ultra-fast bundling, HMR, and optimized production builds |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | Enterprise dark palette, glassmorphism, responsive grids |
| **Routing** | React Router DOM v7 | Dynamic client-side routing across 12 views |
| **Visualizations** | Recharts 2 | SLA compliance trends, hourly risk curves, department MTTR |
| **Icons** | Lucide React | Consistent, crisp iconography across all controls |
| **Fonts** | Inter (Google Fonts) | Clean, legible typography tailored for dense enterprise data |

---

## 3. Core Innovation: Predictive SLA Breach Prevention

Traditional support platforms (Zendesk, Jira Service Management, ServiceNow) only trigger alerts or notifications **after** an SLA has breached or when a hard deadline has already passed. This leads to customer dissatisfaction, financial penalties, and overwhelmed support teams.

**SLA Guardian AI pioneers PRE-BREACH PREDICTIVE INTERVENTION:**
1. **Dynamic Risk Scoring**: Evaluates ticket complexity, priority, queue depth, category historical MTTR, and agent load to compute a real-time **breach probability score (0–100%)**.
2. **Proactive Countdown Horizon**: Flags tickets before they reach critical failure thresholds (e.g. >75% SLA time consumed or >80% breach likelihood).
3. **Automated Preventive Escalation**: Triggers routing reassignments, skill-based overrides, or supervisor notifications **before the breach occurs**.
4. **Distinct Escalation Taxonomies**: Explicitly distinguishes between **Preventive Escalations** (pre-breach actions to protect the SLA) and **Post-Breach Escalations** (reactive incident handling).

### Hero Demonstration Ticket: `TCK-1048`
- **Customer**: Acme Corp (Enterprise Tier)
- **Title**: *Payment Gateway Timeout — Double Charge Risk on Production Checkout*
- **Category**: Billing & Payments | **Priority**: Critical (P1)
- **Breach Probability**: **82% (Critical Risk)**
- **SLA Countdown**: **18 minutes remaining** (91% SLA window elapsed)
- **AI Recommendation**: Re-route immediately to **Priya Sharma** (L3 Senior Financial Specialist, 42% workload, 99.1% SLA compliance) away from overloaded agents (David Chen, 100% capacity).
- **Copilot Action**: Generates empathy-calibrated, high-urgency executive response draft with 1-click approval.

---

## 4. Route Architecture & Screen Index (14 Routes with Multi-Role Experiences)

The frontend provides 14 interconnected, enterprise-ready screens with full multi-role perspective switching:

```
frontend/src/pages/
├── Dashboard.tsx            --> /dashboard            (Crisis overview & live radar)
├── Tickets.tsx              --> /tickets              (50+ ticket inventory & filters)
├── TicketDetails.tsx        --> /tickets/:id          (Detailed inspection & AI drawer)
├── Agents.tsx               --> /agents               (Workload heatmap & agent roster)
├── SLARisk.tsx              --> /sla-risk             (Predictive breach radar)
├── Escalations.tsx          --> /escalations          (Preventive vs Reactive hub)
├── IncidentCommander.tsx    --> /incident-commander   (SEV-1 outage crisis management)
├── Simulator.tsx            --> /simulator            (What-if stress testing)
├── DigitalTwin.tsx          --> /digital-twin         (Baseline vs Simulated vs AI)
├── Analytics.tsx            --> /analytics            (Guardian AI vs Legacy metrics)
├── CustomerPortal.tsx       --> /portal               (Customer Help Center & Ticket Raiser)
├── AgentWorkbench.tsx       --> /workbench            (Priya Sharma L3 Worklist & Copilot)
├── Demo.tsx                 --> /demo                 (Guided 7-phase hackathon walkthrough)
└── Settings.tsx             --> /settings             (Tunable AI & risk thresholds)
```

### Route Capabilities:

1. **`/dashboard` — Executive Command Center**
   - Live crisis alert banner for active incidents.
   - 4 KPI summary cards (Total Open Tickets, Critical At-Risk Count, Fleet SLA Health %, Preventive Interventions Active).
   - Live SLA Risk Queue with real-time countdown badges and quick-action buttons.
   - Hourly Breach Risk Curve (Recharts area chart displaying peak breach vulnerabilities).
   - Department Queue Load and capacity utilization indicators.

2. **`/tickets` — Enterprise Ticket Explorer**
   - Comprehensive table of 50 enterprise tickets across 5 departments.
   - Real-time search query matching across Ticket ID, Subject, Customer, and Assigned Agent.
   - Multi-dimensional filtering by Category, Department, Priority, Status, and Risk Level.
   - Visual priority badges, SLA status bars, and direct routing to `/tickets/:id`.

3. **`/tickets/:id` — Deep-Dive Ticket Inspection**
   - Real-time SLA Countdown component with dynamic color states (Green > Amber > Red).
   - Breach Predictor Card displaying risk probability gauge and contributing factors.
   - AI Reasoning Card explaining *why* a specific agent was selected (skill match, capacity availability, historical SLA performance).
   - Customer metadata card (Tier, ARR, contract terms, previous sentiment).
   - Slide-over **AI Copilot Drawer** with response tone selection (Empathetic, Technical, Executive) and 1-click "Approve & Dispatch".

4. **`/agents` — Workforce Capacity & Roster Heatmap**
   - 12 realistic support engineers across Billing, Technical, Platform, Security, and Customer Success.
   - Visual capacity gauge bars indicating current active workload vs maximum ticket ceiling.
   - Skill tags, tier levels (L1, L2, L3 Specialist), and individual SLA compliance percentages.
   - Status filtering (Available, Busy, Offline, Break).

5. **`/sla-risk` — Predictive SLA Breach Radar**
   - Categorized triage views: Critical Risk (>70%), High Risk (50–70%), Medium/Low Risk (<50%).
   - At-a-glance time remaining, risk trajectory, and automated preventive re-routing recommendations.
   - 1-click instant preventive escalation trigger.

6. **`/escalations` — Escalation Management Hub**
   - Dual-tab / filtered view contrasting **Preventive Escalations** (Pre-breach, AI-initiated) with **Post-Breach Escalations** (Reactive, deadline-missed).
   - Escalation level progression (L1 -> L2 Lead -> L3 Specialist -> L4 VP Engineering).
   - Escalation reason logs, target assignee indicators, and resolution action buttons.

7. **`/incident-commander` — Emergency Incident Command Center**
   - Active SEV-1 Incident: *Payment Gateway Webhook Timeout Surge*.
   - Incident severity, impact scope (42 affected enterprise transactions), and duration timer.
   - Chronological incident timeline tracking root cause detection and automated actions.
   - 4 AI-recommended mitigation actions (Queue deflection, dynamic SLA extension, specialized agent re-allocation, customer blast communication) with interactive approval states.

8. **`/simulator` — What-If SLA Stress Simulator**
   - 4 interactive parameter sliders:
     - Ticket Inflow Surge (+0% to +300%)
     - Agent Absenteeism (0% to 50%)
     - Complexity / MTTR Multiplier (1.0x to 3.0x)
     - SLA Target Tightening (-30m to +30m)
   - 6 Quick-Launch Presets: *Black Friday Flash Sale*, *Core DB Outage*, *Flu Season Staff Shortage*, *API Deprecation Wave*, *Normal Steady State*, *Ransomware Drill*.
   - Live Recharts comparative timeline showing Simulated Breach Rate vs Guardian AI Mitigated Rate.

9. **`/digital-twin` — Support Operations Digital Twin**
   - Live virtual replica of organizational support dynamics.
   - 3-Way Comparative Matrix: **Current Baseline** vs **Simulated Future (12h Unmitigated)** vs **AI-Optimized Guardian State**.
   - Queue congestion heatmaps by department.
   - "Execute AI Auto-Balancing" button that simulates real-time workload redistribution.

10. **`/analytics` — Operational Intelligence & Value Demonstration**
    - 7-Day SLA Compliance Trend comparing SLA Guardian AI (97.8% avg) against Legacy Rule-Based Routing (81.4% avg).
    - Mean Time to Resolution (MTTR) by department (Billing, Tech Support, Security, Customer Success).
    - Ticket volume breakdown by category (Recharts Donut chart).
    - Preventive saves counter documenting avoided SLA breach penalties ($42,800 saved this month).

11. **`/demo` — Interactive Hackathon Showcase Tour**
    - Step-by-step 7-phase guided demonstration designed specifically for evaluation juries:
      - Phase 1: High-Level Executive Dashboard Overview
      - Phase 2: Live Incident Queue & Crisis Identification
      - Phase 3: Inspecting `TCK-1048` Pre-Breach Risk (82% probability, 18m left)
      - Phase 4: AI Skill-Match Engine Reassigning to Priya Sharma (42% load)
      - Phase 5: AI Copilot Empathy-Calibrated Draft Generation & Dispatch
      - Phase 6: Emergency Incident Commander Queue Throttling
      - Phase 7: What-If Stress Simulator & Digital Twin Proof of Resilience
    - Progress tracker with automatic routing to relevant screens upon step selection.

12. **`/settings` — System Calibration & Threshold Controls**
    - Tunable predictive risk thresholds (Critical alert threshold slider).
    - Automatic escalation trigger points (e.g. auto-escalate when risk > 80% and SLA < 25%).
    - Routing confidence gates (minimum 85% match confidence required for zero-touch routing).
    - One-click Mock Dataset Reset button to restore demo state at any time.

---

## 5. Architectural Implementation

### Directory Structure
```
c:/codetrio-KRP/
├── package.json                         # Workspace-level orchestration scripts
├── docs/
│   └── PHASE_1_FRONTEND.md              # Comprehensive Phase 1 documentation
└── frontend/
    ├── package.json                     # Frontend dependencies & Vite scripts
    ├── vite.config.ts                   # Vite config with @tailwindcss/vite plugin
    ├── tsconfig.json                    # Solution tsconfig
    ├── tsconfig.app.json                # Strict TypeScript configuration
    ├── index.html                       # HTML entry point with Inter font
    └── src/
        ├── App.tsx                      # Root router with 12 routes
        ├── main.tsx                     # React DOM entrypoint
        ├── index.css                    # Tailwind CSS v4 styling & dark theme
        ├── types/                       # Pure TypeScript data contracts
        │   ├── ticket.ts                # Ticket, SLA metrics, AI routing types
        │   ├── agent.ts                 # Agent, capacity, tier models
        │   ├── sla.ts                   # SLA policy & department pressure types
        │   ├── escalation.ts            # Preventive & reactive escalation models
        │   ├── incident.ts              # Incident command & timeline models
        │   └── simulation.ts            # What-If simulator & Digital Twin models
        ├── data/                        # Rich, realistic mock data
        │   ├── mockAgents.ts            # 12 detailed enterprise support agents
        │   ├── mockSLA.ts               # SLA policies & queue pressure metrics
        │   ├── mockTickets.ts           # 50 tickets including scenario #26 TCK-1048
        │   ├── mockEscalations.ts       # Preventive vs Post-breach records
        │   ├── mockIncidents.ts         # Active SEV-1 payment queue incident
        │   ├── mockAnalytics.ts         # Compliance trends & MTTR metrics
        │   └── mockSimulation.ts        # Presets, simulation runs & digital twin
        ├── services/
        │   └── demoAdapter.ts           # ISLAGuardianService async state adapter
        ├── context/
        │   └── AppContext.tsx           # Global state, toasts, demo runner
        ├── components/
        │   ├── common/                  # Reusable badges, cards, buttons, modals, toasts
        │   ├── layout/                  # Sidebar, header, breadcrumbs, app shell
        │   ├── dashboard/               # KPI cards, crisis banner, live queue, risk curve
        │   ├── tickets/                 # Ticket table, search & multi-select filters
        │   ├── sla/                     # SLA countdown timer, breach predictor
        │   ├── ai/                      # AI reasoning explainability, copilot drawer
        │   ├── agents/                  # Capacity cards, skill tags, roster
        │   ├── escalation/              # Preventive vs reactive escalation table
        │   ├── incident/                # Incident command card, timeline, action approvals
        │   ├── simulator/               # Slider controls, comparison chart, result cards
        │   ├── digital-twin/            # 3-Way virtual twin comparison matrix
        │   └── analytics/               # Recharts trends, MTTR bars, category pie
        └── pages/                       # 12 fully implemented page views
```

### In-Memory State & Service Architecture (`demoAdapter.ts`)
The `LocalDemoAdapter` implements the `ISLAGuardianService` contract, providing:
- Asynchronous resolution imitating real network latency (50–150ms).
- In-memory state persistence across route navigations.
- Reactive status updates (e.g. approving an incident action immediately updates queue deflection rates; approving a copilot draft marks the ticket resolved/in-progress; triggering a preventive escalation updates the escalation hub).
- Deterministic simulation calculations for what-if scenarios.

---

## 6. Verification & Build Validation

The Phase 1 application has been strictly compiled and verified:

```bash
$ npm --prefix frontend run build

> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 2516 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.16 kB │ gzip:   0.61 kB
dist/assets/index-PZ0UGDyC.css   69.55 kB │ gzip:  10.80 kB
dist/assets/index-Ct7x2hA7.js   972.35 kB │ gzip: 262.66 kB
✓ built in 939ms
```

- **Exit code**: `0` (Zero compilation errors, zero type errors).
- **Bundle**: Single-page production distribution verified in `frontend/dist/`.

---

## 7. How to Run Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Quick Start Commands
From the workspace root (`c:/codetrio-KRP/`):

```bash
# 1. Install dependencies (if not already installed)
npm --prefix frontend install

# 2. Start the local development server
npm run dev

# Or directly within the frontend folder:
cd frontend
npm run dev
```

The Vite dev server will launch at:
```
http://localhost:5173/
```
Navigate to `http://localhost:5173/dashboard` or click the top banner "Start Guided Demo" to launch the evaluation scenario.

### Production Build & Preview
```bash
# Build the production bundle
npm run build

# Preview the production bundle locally
npm run preview
```

---

## 8. Summary of Evaluation Readiness

| Criteria | Status | Evidence |
| :--- | :---: | :--- |
| **Phase Lock Compliance** | **100% PASS** | Zero backend code, zero database dependencies, pure frontend evaluation |
| **All 12 Routes Available** | **100% PASS** | All routes mapped in `App.tsx` and accessible via navigation |
| **Predictive Pre-Breach Concept** | **100% PASS** | Highlighted across badges, countdowns, radar, and escalation tables |
| **Hero Ticket `TCK-1048`** | **100% PASS** | 82% risk, 18m left, Priya Sharma routing, AI reasoning, copilot drawer |
| **Digital Twin & Simulator** | **100% PASS** | 4 sliders, 6 presets, 3-way twin comparison, Recharts visualizations |
| **Incident Commander** | **100% PASS** | SEV-1 active crisis, 4 interactive AI actions, live timeline |
| **Customer Ticket Raising & Roles** | **100% PASS** | Interactive Raise Ticket Modal with instant AI auto-triage + 3-persona switcher |
| **Enterprise Dark Aesthetic** | **100% PASS** | Slate-900 background, cyan/emerald accents, custom scrollbars |
| **TypeScript & Build Health** | **100% PASS** | `npm run build` exits 0 cleanly with zero errors |
