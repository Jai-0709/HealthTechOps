# HealthTechOps — Architecture

## Overview

HealthTechOps is designed as a loosely-coupled, service-oriented application where each subsystem has a single clear responsibility. The system is fully containerised with Docker Compose for local development and can be deployed to any container orchestration platform.

---

## Full Architecture Diagram

```mermaid
flowchart TD
    subgraph Browser["🖥️ Browser"]
        SPA["React SPA\nVite · TypeScript · Tailwind"]
    end

    subgraph API["FastAPI Application Server"]
        direction TB
        Router["APIRouter\n/api/v1/*"]
        AuthMW["JWT Auth Middleware\n+ RBAC Guard"]
        IncSvc["Incident Service"]
        AISvc["AI Investigation Service"]
        RemSvc["Remediation Service\n(allowlist-gated)"]
        AuditSvc["Audit Log Service"]
        MetSvc["Metrics Ingestion Service"]
    end

    subgraph DB["PostgreSQL 16"]
        Users["users"]
        Incidents["incidents"]
        Events["incident_events"]
        AIInvest["ai_investigations"]
        Runbooks["runbooks"]
        Remediations["remediation_requests"]
        AuditLogs["audit_logs"]
        SLOs["slo_definitions"]
    end

    subgraph LLM["Local LLM (Ollama)"]
        Llama["Llama 3.2\n:11434"]
    end

    subgraph ObsStack["Observability Stack"]
        Prom["Prometheus\n:9090"]
        Loki["Grafana Loki\n:3100"]
        Graf["Grafana\n:3001"]
    end

    subgraph Agents["Data Collection Agents"]
        MA["Monitoring Agent\n(Python · psutil)\n:9100/metrics"]
    end

    subgraph SynSvc["Synthetic Healthcare Services"]
        Claims["Claims API\n:8010"]
        Provider["Provider Portal\n:8011"]
        Pharmacy["Pharmacy Svc\n:8012"]
        Identity["Identity Svc\n:8013"]
        Notif["Notification Svc\n:8014"]
        DBSvc["DB Service\n:8015"]
    end

    SPA -->|REST / JSON| Router
    Router --> AuthMW
    AuthMW --> IncSvc & AISvc & RemSvc & AuditSvc & MetSvc
    IncSvc & AISvc & RemSvc & AuditSvc & MetSvc --> DB
    AISvc -->|HTTP prompt| Llama

    MA -->|scrape| Prom
    Claims & Provider & Pharmacy & Identity & Notif & DBSvc -->|/prometheus-metrics| Prom
    API -->|structured JSON logs| Loki
    Prom --> Graf
    Loki --> Graf
```

---

## Component Descriptions

### Frontend (React SPA)
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 with Claude-inspired design tokens (cream canvas, coral accents)
- **State**: Zustand (auth + theme) + TanStack Query (server state)
- **Charts**: Recharts for time-series metric visualisations

### Backend (FastAPI)
- **Framework**: FastAPI 0.115 on Python 3.11
- **ORM**: SQLAlchemy 2.0 (SQLite for local dev, PostgreSQL for production)
- **Migrations**: Alembic with autogenerate
- **Auth**: python-jose for JWT signing, passlib/bcrypt for password hashing with RBAC guards
- **Validation**: Pydantic v2 for all request/response schemas

### Monitoring Agent
A standalone Python script (`monitoring/agent.py`) that:
1. Collects host metrics (CPU, memory, disk, network) via `psutil` every 15 seconds
2. Exposes them as Prometheus-format metrics on `:9100/metrics`
3. Regularly monitors synthetic healthcare services on ports 8010-8015

### Synthetic Services
Six Flask micro-applications simulating realistic healthcare service behaviour:
- Configurable latency (normal distribution) and error rates
- `/health`, `/metrics`, `/logs`, `/prometheus-metrics`, and `/inject-failure` endpoints on each port
- `simulator.py` launches all six concurrently with reentrant thread safety (`RLock`)

### AI Investigation Engine
When an incident is escalated to AI, the backend:
1. Collects the last N metric samples for affected services
2. Builds a structured prompt with incident context, metric anomalies, and system topology
3. Sends the prompt to Ollama (Llama 3.2) via HTTP
4. Parses the response to extract: root cause hypothesis, confidence score, contributing factors, recommended actions
5. Stores the structured result in `ai_investigations` table
6. All recommended actions are cross-referenced against the remediation allowlist before being surfaced to the user

### Remediation Allowlist Engine
Prevents unconstrained AI-driven actions:
- `ALLOWED_REMEDIATION_ACTIONS` is a hardcoded list of safe operations (service restart, scale-up, cache clear, circuit-breaker toggle)
- Any AI-suggested action not in the allowlist is **rejected** before display
- Approved actions require a second human confirmation in the UI
- All executions are logged to `remediation_requests` with actor and outcome

---

## Data Flow

### Metric Collection Flow
```
psutil → Monitoring Agent → POST /metrics/ingest → PostgreSQL
                         ↘ Prometheus scrape ← Prometheus server → Grafana
```

### Incident Lifecycle
```
Metric breach detected → Incident created (OPEN) 
  → Engineer investigates → AI Investigation requested
  → Ollama generates hypothesis → Engineer reviews
  → Remediation action approved → Action executed
  → Incident resolved (CLOSED) → Audit log written
```

### Authentication Flow
```
POST /auth/login (email+password)
  → bcrypt verify → JWT issued (HS256, 30min exp)
  → Client stores token → Authorization: Bearer <token>
  → JWT middleware decodes → RBAC role check → handler
```

---

## Security Architecture

See [SECURITY.md](SECURITY.md) for the full security design.

**Key principles:**
- Zero trust: every API request re-validates the JWT and checks RBAC
- AI is advisory only: no autonomous action without human approval
- Allowlist architecture: AI cannot suggest actions outside the safe list
- Full audit trail: every write operation appended to the immutable audit log

---

## AI Pipeline Detail

```mermaid
sequenceDiagram
    participant E as Engineer (UI)
    participant B as Backend API
    participant DB as PostgreSQL
    participant O as Ollama (Llama 3.2)

    E->>B: POST /incidents/{id}/investigate
    B->>DB: Fetch incident + last 20 metric samples
    B->>B: Build structured prompt
    B->>O: POST /api/chat (prompt)
    O-->>B: Streamed response
    B->>B: Parse: hypothesis, confidence, factors, actions
    B->>B: Filter actions against allowlist
    B->>DB: INSERT ai_investigations
    B-->>E: AI investigation result
    E->>B: POST /remediation (approved action)
    B->>DB: INSERT remediation_request (pending)
    B->>B: Execute action (safe subprocess / API call)
    B->>DB: UPDATE remediation_request (completed)
    B->>DB: INSERT audit_log
```

---

## Deployment Topology (Docker Compose)

```
localhost
├── :5173  → frontend (nginx serving React SPA)
├── :8000  → backend (FastAPI/Uvicorn)
├── :8010–8015 → synthetic healthcare services
├── :9100  → monitoring agent metrics
├── :9090  → Prometheus
├── :3001  → Grafana
├── :3100  → Loki
└── :5432  → PostgreSQL
```

All services share a default Docker bridge network. Service discovery uses container names (`backend`, `postgres`, `prometheus`, `loki`, `monitoring-agent`).
