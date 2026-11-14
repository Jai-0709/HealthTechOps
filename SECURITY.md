# HealthTechOps — Security Design

> **Note:** This is a portfolio/learning project using entirely synthetic data. The security design described here reflects industry best practices as implemented for demonstration purposes. This system should not be used to process real PHI or PII without a comprehensive production security review.

---

## Authentication Design (JWT)

### Token Issuance
- Credentials are validated against bcrypt-hashed passwords stored in PostgreSQL (`users` table)
- On successful authentication, the backend issues a signed JWT using **HS256** (HMAC-SHA256)
- The signing key is configured via `JWT_SECRET_KEY` environment variable — this **must** be set to a long random string in any deployed environment
- Token expiry defaults to **30 minutes** (`ACCESS_TOKEN_EXPIRE_MINUTES`), configurable per environment

### Token Validation
- Every protected endpoint passes through the `get_current_user` dependency
- The JWT is extracted from the `Authorization: Bearer <token>` header
- Validation checks: signature validity, expiry (`exp` claim), and presence of a valid `sub` (user ID)
- If any check fails, the request is rejected with **401 Unauthorized**

### Token Storage (Frontend)
- The JWT is stored in Zustand's auth store with `persist` to `localStorage`
- `localStorage` was chosen over `httpOnly` cookies for simplicity in this demo — a production system should use `httpOnly` SameSite=Strict cookies to mitigate XSS token theft

### Refresh Strategy
- This demo uses a simple expiring token without refresh tokens
- Production deployment should implement a rotation scheme (short-lived access token + longer-lived httpOnly refresh token)

---

## Authorization Design (RBAC)

### Roles

| Role | Description | Permitted Actions |
|------|-------------|-------------------|
| `ADMIN` | Platform administrator | Full access — user management, all endpoints |
| `SRE` | Site Reliability Engineer | Incidents, AI investigation, remediation approval, runbooks |
| `ANALYST` | On-call analyst | View all data, trigger AI investigation, cannot approve remediation |
| `VIEWER` | Read-only stakeholder | View dashboards, metrics, incidents (no write access) |

### Enforcement
- Role is embedded in the JWT payload as `role` claim
- Each route handler declares its minimum required role via a `require_role(...)` dependency
- Role checks are performed **server-side** on every request — the frontend role-based UI is a convenience layer only, not a security boundary

### RBAC Hierarchy
```
ADMIN > SRE > ANALYST > VIEWER
```
A higher role always has the permissions of lower roles.

---

## Input Validation

- All API request bodies are validated by **Pydantic v2** schemas with strict typing
- String lengths are bounded (e.g., incident title max 255 chars, description max 4000 chars)
- Enum fields (severity, status, role) are enforced at the Pydantic layer — invalid values return 422
- SQL injection is prevented by SQLAlchemy's parameterised query API — raw SQL strings are not used
- File upload endpoints (if any) validate MIME type and size before processing

---

## Prompt Injection Protection

The AI investigation engine constructs prompts from user-controlled data (incident descriptions, service names). To mitigate prompt injection:

1. **Structured prompt template**: User input is inserted into a fixed template with clear delimiters (`--- INCIDENT CONTEXT ---`, `--- METRICS ---`). The LLM is instructed to treat these sections as data, not instructions.
2. **Output parsing**: The backend extracts only structured fields (hypothesis, confidence, factors, actions) from the LLM response — free-form text is never executed or used as a command
3. **Response sanitisation**: LLM output is HTML-escaped before rendering in the frontend to prevent XSS via injected markup
4. **No tool use / function calling**: The LLM is used in pure text completion mode — it cannot invoke functions, make HTTP requests, or access the filesystem

---

## Allowlist Architecture for Remediation

This is the most critical security control in the system.

### Design Principle
The AI **cannot** autonomously execute any action. It can only **suggest** actions. Every suggestion is cross-referenced against a hardcoded allowlist before being shown to the user.

### Allowed Actions (Allowlist)

```python
ALLOWED_REMEDIATION_ACTIONS = {
    "restart_service",          # Restart a named synthetic service
    "scale_service",            # Increase replica count (simulated)
    "clear_cache",              # Clear in-memory cache
    "toggle_circuit_breaker",   # Open/close circuit breaker (simulated)
    "rotate_connection_pool",   # Reset DB connection pool
    "flush_dead_letter_queue",  # Drain DLQ (simulated)
}
```

### Enforcement Flow
1. AI response parsed → action strings extracted
2. Each action string checked against `ALLOWED_REMEDIATION_ACTIONS` set
3. Non-allowlisted actions are **dropped** and logged as a security event
4. Remaining actions presented to the user for approval
5. User must explicitly click "Approve & Execute" — no auto-execute
6. Approved action is inserted into `remediation_requests` table with status `PENDING`
7. Backend executes the action (safe, simulated call) and updates status to `COMPLETED` or `FAILED`
8. Outcome written to audit log

### Why an Allowlist (Not a Denylist)
A denylist requires enumerating every dangerous action — an impossible task for a general-purpose LLM that can generate arbitrary strings. An allowlist assumes everything is dangerous unless explicitly approved, which is the correct security posture for production systems.

---

## Audit Logging

Every state-changing operation and sensitive read is appended to the `audit_logs` table:

| Field | Description |
|-------|-------------|
| `id` | UUID primary key |
| `timestamp` | UTC timestamp (server-generated, not client-supplied) |
| `actor_id` | User ID of the authenticated user |
| `actor_role` | Role at time of action |
| `action` | Enum: `LOGIN`, `LOGOUT`, `INCIDENT_CREATE`, `INCIDENT_UPDATE`, `AI_INVESTIGATE`, `REMEDIATION_REQUEST`, `REMEDIATION_EXECUTE`, `USER_CREATE`, `USER_UPDATE` |
| `resource_type` | E.g., `incident`, `remediation`, `user` |
| `resource_id` | UUID of the affected resource |
| `details` | JSON blob with before/after state or relevant context |
| `ip_address` | Requester IP (from `X-Real-IP` header or connection) |
| `outcome` | `SUCCESS` or `FAILURE` |

Audit logs are **append-only** — no UPDATE or DELETE operations are permitted on this table. In production, this table should be backed up to immutable object storage (e.g., S3 with Object Lock).

---

## Known Security Considerations

| Consideration | Current State | Production Recommendation |
|--------------|---------------|--------------------------|
| JWT storage | `localStorage` | Move to `httpOnly` SameSite=Strict cookie |
| Token refresh | No refresh token | Implement short-lived access + rotating refresh tokens |
| HTTPS | Not enforced (dev) | Terminate TLS at load balancer / nginx in production |
| Rate limiting | Not implemented | Add per-IP rate limiting on `/auth/login` (e.g., 5 req/min) |
| Secret rotation | Manual `.env` | Use a secrets manager (Vault, AWS Secrets Manager) in production |
| DB credentials | Shared service account | Use per-service DB roles with minimal privileges in production |
| Container security | Default base images | Use distroless or slim images with non-root users in production |
| LLM data privacy | Local Ollama only | Ensure no PHI/PII is ever sent to cloud LLM APIs |
| CORS | Configurable | Restrict to known frontend origins only |
| Input sanitisation | Pydantic + HTML escape | Add CSP headers and consider a WAF for internet-facing deployment |

---

## Threat Model Summary

| Threat | Mitigation |
|--------|-----------|
| Credential stuffing | bcrypt hashing; (TODO) rate limiting on login |
| JWT forgery | HS256 with long random secret; expiry enforced |
| Privilege escalation | Server-side RBAC on every endpoint |
| SQL injection | SQLAlchemy parameterised queries only |
| XSS via AI output | HTML-escaped before render; CSP header recommended |
| Prompt injection → code execution | Allowlist gates all AI-suggested actions |
| Insider threat / unauthorised action | Full audit trail with actor, timestamp, IP |
| Data exfiltration | All data is synthetic; no real PHI present |
