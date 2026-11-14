# HealthTechOps — Project Status

> **HealthTechOps** — Autonomous Cloud Reliability & AI Incident Operations Platform.
> All healthcare telemetry and services are simulated for production reliability benchmarking.

Last Updated: 2026-11-14

---

## 🚀 Live System Status

| Component | Port / URL | State | Verification |
|-----------|------------|-------|--------------|
| **Frontend (React 19 + Vite + Tailwind 4)** | [http://localhost:5173](http://localhost:5173) | 🟢 RUNNING | HTTP 200, 0 TS errors, Production build verified |
| **Backend API (FastAPI + SQLite)** | [http://localhost:8000](http://localhost:8000) | 🟢 RUNNING | HTTP 200 `/health`, 30/30 Pytest suite passing |
| **Interactive API Docs (Swagger UI)** | [http://localhost:8000/docs](http://localhost:8000/docs) | 🟢 RUNNING | Fully interactive OpenAPI schema |
| **Monitoring Agent (Prometheus)** | [http://localhost:9100/metrics](http://localhost:9100/metrics) | 🟢 RUNNING | HTTP 200, Live host + service gauges |
| **Synthetic Claims API** | [http://localhost:8010/health](http://localhost:8010/health) | 🟢 RUNNING | Status: healthy, Failure injection active |
| **Synthetic Provider Portal** | [http://localhost:8011/health](http://localhost:8011/health) | 🟢 RUNNING | Status: healthy |
| **Synthetic Pharmacy Service** | [http://localhost:8012/health](http://localhost:8012/health) | 🟢 RUNNING | Status: healthy |
| **Synthetic Identity Service** | [http://localhost:8013/health](http://localhost:8013/health) | 🟢 RUNNING | Status: healthy |
| **Synthetic Notification Service** | [http://localhost:8014/health](http://localhost:8014/health) | 🟢 RUNNING | Status: healthy |
| **Synthetic Database Service** | [http://localhost:8015/health](http://localhost:8015/health) | 🟢 RUNNING | Status: healthy |
| **Ollama AI Investigation Engine** | [http://localhost:11434](http://localhost:11434) | 🟢 CONNECTED | Model: `llama3.2`, E2E incident analysis verified |

---

## ✅ Completed Capabilities

### 1. Infrastructure & Architecture
- [x] Complete modular clean architecture with clear separation of concerns
- [x] Production-ready containerization: `docker-compose.yml`, `infrastructure/docker/`
- [x] Monitoring configs: Prometheus (`infrastructure/prometheus/`), Loki (`infrastructure/loki/`), Grafana (`infrastructure/grafana/`)
- [x] Documentation: `README.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DESIGN.md`
- [x] Startup automation: `start_local.ps1` for one-command local startup

### 2. Backend Engineering (Python / FastAPI)
- [x] Database persistence with SQLAlchemy models and SQLite/PostgreSQL support
- [x] Authentication & RBAC (JWT Bearer tokens, roles: `ADMIN`, `SRE_ENGINEER`, `VIEWER`)
- [x] Background incident detector with automatic metric analysis & 10-minute deduplication
- [x] SLO & Error Budget calculator (rolling 30-day window, availability, P95 latency, MTTD, MTTR)
- [x] Immutable Audit Logger for all actions (incident updates, AI investigations, remediations)
- [x] Automated Test Suite: **30/30 Pytest tests passing** (`test_auth.py`, `test_services_incidents.py`, `test_remediation.py`, `test_slo.py`, `test_ai_agent.py`, `test_health.py`)

### 3. AIOps & Incident Investigation
- [x] Local LLM integration with Ollama (`llama3.2`)
- [x] AI Prompt Injection Protection (`sanitize_input` redacting injection vectors)
- [x] Strict Remediation Allowlist (`SAFE_ACTIONS_ALLOWLIST` preventing unauthorized commands)
- [x] End-to-end incident investigation returning root cause summary, confidence score, evidence items, and safe actions
- [x] AI Model Benchmark Evaluation harness (`/api/v1/evaluation/run` benchmarking against synthetic test cases)

### 4. Human-in-the-Loop Autonomous Remediation
- [x] Remediation request lifecycle: `PENDING` → `APPROVED` / `REJECTED` → `EXECUTING` → `COMPLETED`
- [x] RBAC enforcement: Viewers forbidden from approving or rejecting remediation actions
- [x] Execution simulation engine for actions (service restart, replica scaling, cache clearing, pool flush, etc.)
- [x] Incident timeline auto-updates with `REMEDIATION_APPLIED` event when executed

### 5. Frontend UI/UX (React 19 + TypeScript + Vite + Tailwind 4)
- [x] Claude-inspired enterprise design system (Cream `#faf9f5`, Coral `#cc785c`, Ink `#141413`)
- [x] Responsive layout with collapsible Sidebar and persistent Dark/Light mode toggle
- [x] All 13 Pages fully operational and integrated with real backend APIs:
  - `Login.tsx` — Secure JWT authentication
  - `Overview.tsx` — Reliability dashboard with live health scores & incident summaries
  - `Infrastructure.tsx` — Host system metrics & active process monitor
  - `Services.tsx` — Microservices catalog with real-time status badges
  - `ServiceDetail.tsx` — Service metrics, logs, and interactive failure injection
  - `Observability.tsx` — Multi-metric time-series telemetry charts & structured log search
  - `Incidents.tsx` — Incident operations table with filtering and triage
  - `IncidentDetail.tsx` — Incident timeline, evidence cards, and 1-click AI investigation
  - `AIInvestigation.tsx` — Diagnostic investigation workspace & root-cause explanations
  - `Automation.tsx` — Runbook library & pending remediation approval queue
  - `Reliability.tsx` — SLO tracking, error budget consumption bars, and MTTD/MTTR analytics
  - `AIEvaluation.tsx` — Model evaluation dashboard with accuracy benchmarks
  - `AuditLogs.tsx` — Searchable compliance audit trail with role filtering
  - `Settings.tsx` — Configuration panels for Ollama, detection thresholds, and system health

---

## 🔐 Default Demo Accounts

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@healthtechops.local` | `HealthTechOps2024!` | `ADMIN` | Full control: system config, AI eval, remediation approvals |
| `sre@healthtechops.local` | `HealthTechOps2024!` | `SRE_ENGINEER` | Operational control: incident triage, AI trigger, remediation approvals |
| `viewer@healthtechops.local` | `HealthTechOps2024!` | `VIEWER` | Read-only visibility: dashboards, telemetry, SLOs, runbooks |
