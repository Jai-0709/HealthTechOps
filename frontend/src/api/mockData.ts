import {
  getDemoServices,
  getDemoOverview,
  getDemoIncidents,
  getDemoInvestigation,
  getDemoPendingRemediations,
  getDemoRemediationHistory,
  resolveCurrentAnomaly,
  getCurrentScenario,
  triggerSimulateAnomaly,
  getDemoState,
} from './demoSimulation'

export {
  getDemoServices,
  getDemoOverview,
  getDemoIncidents,
  getDemoInvestigation,
  getDemoPendingRemediations,
  getDemoRemediationHistory,
  resolveCurrentAnomaly,
  getCurrentScenario,
  triggerSimulateAnomaly,
  getDemoState,
}

// Synthetic Demo / Offline Fallback Data for HealthTechOps Portfolio Presentation
// Ensures zero downtime, zero blank dashes, and zero 404/405 errors when hosted standalone on Vercel

export const DEMO_USERS: Record<string, any> = {
  'admin@healthtechops.local': {
    id: 'usr-admin-01',
    email: 'admin@healthtechops.local',
    full_name: 'Admin User',
    role: 'ADMIN',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
  'sre@healthtechops.local': {
    id: 'usr-sre-01',
    email: 'sre@healthtechops.local',
    full_name: 'SRE Engineer',
    role: 'SRE_ENGINEER',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
  'viewer@healthtechops.local': {
    id: 'usr-viewer-01',
    email: 'viewer@healthtechops.local',
    full_name: 'Operations Viewer',
    role: 'VIEWER',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
}

export const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Claims API',
    slug: 'claims-api',
    description: 'Real-time insurance claims processing and adjudication pipeline',
    status: 'HEALTHY',
    cpu_percent: 28.4,
    memory_percent: 42.1,
    request_count: 14200,
    error_count: 12,
    avg_latency_ms: 45.2,
    uptime_percent: 99.98,
    last_checked: new Date().toISOString(),
    port: 8010,
  },
  {
    id: '2',
    name: 'Provider Portal',
    slug: 'provider-portal',
    description: 'Healthcare provider identity, clinic scheduling, and directory',
    status: 'HEALTHY',
    cpu_percent: 34.1,
    memory_percent: 51.0,
    request_count: 9800,
    error_count: 8,
    avg_latency_ms: 62.8,
    uptime_percent: 99.95,
    last_checked: new Date().toISOString(),
    port: 8011,
  },
  {
    id: '3',
    name: 'Pharmacy Service',
    slug: 'pharmacy-service',
    description: 'Digital prescription routing and pharmacy formulary engine',
    status: 'DEGRADED',
    cpu_percent: 74.8,
    memory_percent: 68.2,
    request_count: 8100,
    error_count: 45,
    avg_latency_ms: 180.5,
    uptime_percent: 99.20,
    last_checked: new Date().toISOString(),
    port: 8012,
  },
  {
    id: '4',
    name: 'Identity Service',
    slug: 'identity-service',
    description: 'HIPAA-compliant patient authentication and OAuth 2.0 PKCE',
    status: 'HEALTHY',
    cpu_percent: 19.5,
    memory_percent: 36.4,
    request_count: 22400,
    error_count: 3,
    avg_latency_ms: 22.1,
    uptime_percent: 99.99,
    last_checked: new Date().toISOString(),
    port: 8013,
  },
  {
    id: '5',
    name: 'Notification Service',
    slug: 'notification-service',
    description: 'Encrypted patient notifications and SMS delivery gateway',
    status: 'HEALTHY',
    cpu_percent: 14.2,
    memory_percent: 29.8,
    request_count: 6500,
    error_count: 1,
    avg_latency_ms: 35.0,
    uptime_percent: 99.99,
    last_checked: new Date().toISOString(),
    port: 8014,
  },
  {
    id: '6',
    name: 'Database Service',
    slug: 'database-service',
    description: 'Managed relational primary storage cluster with replication',
    status: 'HEALTHY',
    cpu_percent: 48.0,
    memory_percent: 62.5,
    request_count: 31000,
    error_count: 15,
    avg_latency_ms: 18.4,
    uptime_percent: 99.97,
    last_checked: new Date().toISOString(),
    port: 8015,
  },
]

export const MOCK_INCIDENTS = [
  {
    id: 'inc-001',
    title: 'Pharmacy Service Elevated P95 Latency',
    description: 'P95 latency breached 180ms SLO threshold (target: 100ms). Downstream prescription dispatch affected.',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    service_id: '3',
    service_name: 'Pharmacy Service',
    detected_at: new Date(Date.now() - 42 * 60000).toISOString(),
    root_cause_notes: 'Database connection saturation caused thread blocking in worker pool.',
    evidence: { p95_latency_ms: 180.5, error_rate: 0.055, active_connections: 98 },
    events: [
      { id: 1, event_type: 'ALERT_TRIGGERED', description: 'P95 latency exceeded 150ms SLO threshold for 3 consecutive intervals', occurred_at: new Date(Date.now() - 42 * 60000).toISOString() },
      { id: 2, event_type: 'AI_INVESTIGATION_STARTED', description: 'Autonomous agent dispatched investigation request to local LLM', occurred_at: new Date(Date.now() - 40 * 60000).toISOString() },
      { id: 3, event_type: 'HYPOTHESIS_FORMED', description: 'Hypothesis formed: DB connection pool exhaustion (Confidence: 94%)', occurred_at: new Date(Date.now() - 38 * 60000).toISOString() },
    ],
  },
  {
    id: 'inc-002',
    title: 'Provider Portal Transient 502 Bad Gateway',
    description: 'Nginx reverse proxy received connection reset from upstream application worker.',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    service_id: '2',
    service_name: 'Provider Portal',
    detected_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    resolved_at: new Date(Date.now() - 23 * 3600000).toISOString(),
    root_cause_notes: 'Memory leak during large provider roster query triggered OOM killer.',
    evidence: { memory_mb: 2048, restart_count: 1 },
    events: [
      { id: 10, event_type: 'ALERT_TRIGGERED', description: 'HTTP 502 rate crossed 2% threshold', occurred_at: new Date(Date.now() - 24 * 3600000).toISOString() },
      { id: 11, event_type: 'REMEDIATION_EXECUTED', description: 'Runbook rollback_deployment executed successfully', occurred_at: new Date(Date.now() - 23 * 3600000).toISOString() },
    ],
  },
  {
    id: 'inc-003',
    title: 'Claims API Spike in 429 Rate Limits',
    description: 'Upstream pharmacy partner submitted burst batch claims breaching rate tier.',
    severity: 'LOW',
    status: 'CLOSED',
    service_id: '1',
    service_name: 'Claims API',
    detected_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    resolved_at: new Date(Date.now() - 71 * 3600000).toISOString(),
    root_cause_notes: 'Expected throttle policy enforced correctly on external API client.',
  },
]

export const MOCK_RUNBOOKS = [
  {
    id: 'rb-1',
    name: 'restart_service',
    slug: 'restart-service',
    description: 'Gracefully restart a degraded service to clear transient faults',
    risk_level: 'MEDIUM',
    is_allowlisted: true,
    service_type: 'all',
    steps: [
      'Verify service is in DEGRADED state',
      'Send SIGTERM to process',
      'Wait 30s for graceful shutdown',
      'Start service with original parameters',
      'Verify health endpoint returns 200',
    ],
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'rb-2',
    name: 'clear_cache',
    slug: 'clear-cache',
    description: 'Flush in-memory caches to resolve stale data issues',
    risk_level: 'LOW',
    is_allowlisted: true,
    service_type: 'all',
    steps: [
      'Connect to cache service',
      'Issue FLUSHDB command',
      'Verify cache is empty',
      'Monitor cache hit ratio for 5 minutes',
    ],
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'rb-3',
    name: 'scale_up_replicas',
    slug: 'scale-up-replicas',
    description: 'Increase service replica count to handle elevated load',
    risk_level: 'LOW',
    is_allowlisted: true,
    service_type: 'all',
    steps: [
      'Check current replica count',
      'Verify resource headroom',
      'Set replicas to target count',
      'Wait for all replicas to become ready',
    ],
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'rb-4',
    name: 'rollback_deployment',
    slug: 'rollback-deployment',
    description: 'Revert a service to the previous stable deployment image',
    risk_level: 'HIGH',
    is_allowlisted: true,
    service_type: 'all',
    steps: [
      'Identify last stable deployment tag',
      'Pause incoming traffic',
      'Deploy previous image tag',
      'Run smoke tests',
      'Resume traffic',
    ],
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'rb-5',
    name: 'flush_connection_pool',
    slug: 'flush-connection-pool',
    description: 'Reset database connection pool to clear leaked connections',
    risk_level: 'LOW',
    is_allowlisted: true,
    service_type: 'database-service',
    steps: [
      'List active connections',
      'Drain connection pool gracefully',
      'Reinitialise pool with fresh connections',
    ],
    created_at: '2026-11-01T00:00:00Z',
  },
]

export const MOCK_REMEDIATION_PENDING = [
  {
    id: 'rem-001',
    action_name: 'restart_service',
    incident_id: 'inc-001',
    risk_level: 'MEDIUM',
    status: 'PENDING_APPROVAL',
    requested_at: new Date(Date.now() - 5 * 60000).toISOString(),
    requested_by: 'admin@healthtechops.local',
  },
  {
    id: 'rem-002',
    action_name: 'flush_connection_pool',
    incident_id: 'inc-001',
    risk_level: 'LOW',
    status: 'PENDING_APPROVAL',
    requested_at: new Date(Date.now() - 25 * 60000).toISOString(),
    requested_by: 'sre@healthtechops.local',
  },
]

export const MOCK_SLO_STATUS = [
  {
    service_name: 'Claims API',
    slug: 'claims-api',
    availability_target: 99.9,
    availability_actual: 99.98,
    latency_target_ms: 100,
    latency_actual_ms: 45.2,
    latency_p95_target_ms: 100,
    latency_p95_actual_ms: 45.2,
    error_rate_target: 0.1,
    error_rate_actual: 0.02,
    error_budget_remaining: 80,
    error_budget_total: 100,
    error_budget_pct_remaining: 80.0,
    is_meeting_slo: true,
    window_days: 30,
  },
  {
    service_name: 'Provider Portal',
    slug: 'provider-portal',
    availability_target: 99.9,
    availability_actual: 99.95,
    latency_target_ms: 120,
    latency_actual_ms: 62.8,
    latency_p95_target_ms: 120,
    latency_p95_actual_ms: 62.8,
    error_rate_target: 0.1,
    error_rate_actual: 0.03,
    error_budget_remaining: 70,
    error_budget_total: 100,
    error_budget_pct_remaining: 70.0,
    is_meeting_slo: true,
    window_days: 30,
  },
  {
    service_name: 'Pharmacy Service',
    slug: 'pharmacy-service',
    availability_target: 99.5,
    availability_actual: 99.20,
    latency_target_ms: 100,
    latency_actual_ms: 180.5,
    latency_p95_target_ms: 100,
    latency_p95_actual_ms: 180.5,
    error_rate_target: 0.5,
    error_rate_actual: 0.82,
    error_budget_remaining: 18,
    error_budget_total: 100,
    error_budget_pct_remaining: 18.0,
    is_meeting_slo: false,
    window_days: 30,
  },
  {
    service_name: 'Identity Service',
    slug: 'identity-service',
    availability_target: 99.99,
    availability_actual: 99.99,
    latency_target_ms: 50,
    latency_actual_ms: 22.1,
    latency_p95_target_ms: 50,
    latency_p95_actual_ms: 22.1,
    error_rate_target: 0.01,
    error_rate_actual: 0.005,
    error_budget_remaining: 95,
    error_budget_total: 100,
    error_budget_pct_remaining: 95.0,
    is_meeting_slo: true,
    window_days: 30,
  },
  {
    service_name: 'Notification Service',
    slug: 'notification-service',
    availability_target: 99.5,
    availability_actual: 99.99,
    latency_target_ms: 80,
    latency_actual_ms: 35.0,
    latency_p95_target_ms: 80,
    latency_p95_actual_ms: 35.0,
    error_rate_target: 0.5,
    error_rate_actual: 0.01,
    error_budget_remaining: 92,
    error_budget_total: 100,
    error_budget_pct_remaining: 92.0,
    is_meeting_slo: true,
    window_days: 30,
  },
  {
    service_name: 'Database Service',
    slug: 'database-service',
    availability_target: 99.99,
    availability_actual: 99.97,
    latency_target_ms: 30,
    latency_actual_ms: 18.4,
    latency_p95_target_ms: 30,
    latency_p95_actual_ms: 18.4,
    error_rate_target: 0.01,
    error_rate_actual: 0.008,
    error_budget_remaining: 75,
    error_budget_total: 100,
    error_budget_pct_remaining: 75.0,
    is_meeting_slo: true,
    window_days: 30,
  },
]

export const MOCK_AUDIT_LOGS = [
  {
    id: 'aud-1',
    user_email: 'sre@healthtechops.local',
    user_role: 'SRE_ENGINEER',
    action: 'RUNBOOK_EXECUTE',
    resource_type: 'runbook',
    resource_id: 'clear-cache',
    outcome: 'success',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    details: 'Runbook clear-cache executed on pharmacy-service',
  },
  {
    id: 'aud-2',
    user_email: 'admin@healthtechops.local',
    user_role: 'ADMIN',
    action: 'INCIDENT_ACKNOWLEDGE',
    resource_type: 'incident',
    resource_id: 'inc-001',
    outcome: 'success',
    timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
    details: 'Incident acknowledged by on-call engineer',
  },
  {
    id: 'aud-3',
    user_email: 'admin@healthtechops.local',
    user_role: 'ADMIN',
    action: 'AI_INVESTIGATION_TRIGGER',
    resource_type: 'incident',
    resource_id: 'inc-001',
    outcome: 'success',
    timestamp: new Date(Date.now() - 41 * 60000).toISOString(),
    details: 'Ollama llama3.2 investigation dispatched',
  },
  {
    id: 'aud-4',
    user_email: 'sre@healthtechops.local',
    user_role: 'SRE_ENGINEER',
    action: 'SERVICE_FAILURE_INJECT',
    resource_type: 'service',
    resource_id: 'pharmacy-service',
    outcome: 'success',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    details: 'Injected cpu_spike for 60s',
  },
  {
    id: 'aud-5',
    user_email: 'admin@healthtechops.local',
    user_role: 'ADMIN',
    action: 'USER_LOGIN',
    resource_type: 'auth',
    resource_id: 'admin@healthtechops.local',
    outcome: 'success',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    details: 'JWT session authenticated',
  },
]

export function getMockFallback<T>(path: string, method: string = 'GET', _body?: any): T | undefined {
  const clean = path.split('?')[0].replace(/\/+$/, '')

  // Health
  if (clean === '/health') {
    return {
      status: 'healthy',
      version: '1.0.0-rc1',
      timestamp: new Date().toISOString(),
      services_total: 6,
      ai_engine: 'online',
    } as T
  }

  // Auth me
  if (clean === '/auth/me') {
    return DEMO_USERS['admin@healthtechops.local'] as T
  }

  // Overview Dashboard (Must return exact shape Overview.tsx consumes)
  if (clean === '/overview') {
    return getDemoOverview() as T
  }

  // Services Catalog
  if (clean === '/services') {
    return getDemoServices() as T
  }
  if (clean.startsWith('/services/')) {
    const parts = clean.split('/')
    const slug = parts[2]
    if (clean.endsWith('/logs')) {
      return [
        { id: 1, timestamp: new Date(Date.now() - 15000).toISOString(), level: 'INFO', message: `HTTP GET /health 200 OK — latency: 14ms`, service: slug },
        { id: 2, timestamp: new Date(Date.now() - 45000).toISOString(), level: 'INFO', message: `Batch payload ingested successfully: 128 claims processed`, service: slug },
        { id: 3, timestamp: new Date(Date.now() - 75000).toISOString(), level: 'WARN', message: `Connection pool thread acquisition delayed: 62ms > 50ms target`, service: slug },
        { id: 4, timestamp: new Date(Date.now() - 120000).toISOString(), level: 'INFO', message: `Telemetry heartbeat dispatched to monitoring agent: port 9100`, service: slug },
      ] as T
    }
    if (clean.endsWith('/inject-failure')) {
      triggerSimulateAnomaly()
      return { success: true, message: 'Synthetic failure injected into microservice', service: slug } as T
    }
    const found = getDemoServices().find((s) => s.slug === slug) || getDemoServices()[0]
    return found as T
  }

  // Incidents
  if (clean === '/incidents') {
    return getDemoIncidents() as T
  }
  if (clean.startsWith('/incidents/')) {
    const id = clean.split('/')[2]
    const inc = getDemoIncidents().find((i) => i.id === id) || getDemoIncidents()[0]
    return inc as T
  }

  // AI Investigation & Status
  if (clean === '/ai/status') {
    return {
      available: true,
      configured_model: 'llama3.2',
      status: 'ONLINE',
      model: 'llama3.2',
      provider: 'ollama (synthetic engine)',
      connected: true,
      loaded: true,
      context_length: 8192,
      latency_ms: 245,
    } as T
  }
  if (clean === '/ai/investigate' && method === 'POST') {
    const scenario = getCurrentScenario()
    return {
      id: `inv-${scenario.incidentId}`,
      investigation_id: `inv-${scenario.incidentId}`,
      status: 'COMPLETED',
    } as T
  }
  if (clean === '/ai/investigate' || clean.startsWith('/ai/investigate/')) {
    const invId = clean.startsWith('/ai/investigate/') ? clean.split('/')[3] : undefined
    return getDemoInvestigation(invId) as T
  }

  // Remediation & Approvals
  if (clean === '/remediation/request') {
    const scenario = getCurrentScenario()
    return {
      id: `rem-pending-${scenario.incidentId}`,
      action_name: scenario.remediationAction,
      incident_id: scenario.incidentId,
      risk_level: scenario.riskLevel,
      status: 'PENDING_APPROVAL',
      requested_at: new Date().toISOString(),
      requested_by: 'admin@healthtechops.local',
    } as T
  }
  if (clean === '/remediation/pending') {
    return getDemoPendingRemediations() as T
  }
  if (clean === '/remediation' || clean.startsWith('/remediation/')) {
    if (clean.endsWith('/approve')) {
      const scenario = getCurrentScenario()
      resolveCurrentAnomaly(scenario.remediationAction)
      return { success: true, status: 'APPROVED', executed: true, timestamp: new Date().toISOString() } as T
    }
    if (clean.endsWith('/reject')) {
      return { success: true, status: 'REJECTED', executed: false, timestamp: new Date().toISOString() } as T
    }
    return getDemoRemediationHistory() as T
  }

  // Runbooks
  if (clean === '/runbooks') {
    return MOCK_RUNBOOKS as T
  }
  if (clean.startsWith('/runbooks/') && clean.endsWith('/execute')) {
    const parts = clean.split('/')
    const rbId = parts[2]
    const rb = MOCK_RUNBOOKS.find((r) => r.id === rbId)
    resolveCurrentAnomaly(rb?.name)
    return { success: true, status: 'EXECUTING', steps_total: 5, steps_completed: 5, executed: true } as T
  }

  // SLO & MTTx Metrics
  if (clean === '/slo') {
    return MOCK_SLO_STATUS as T
  }
  if (clean === '/slo/mttd-mttr') {
    return {
      mttd_minutes: 2.8,
      mttr_minutes: 14.2,
      total_resolved: 24,
      total_incidents: 25,
      availability_overall: 99.94,
    } as T
  }

  // Observability: Metrics, Logs, Traces
  if (clean === '/observability/metrics') {
    const times = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(Date.now() - (11 - i) * 5 * 60000)
      return {
        timestamp: d.toISOString(),
        cpu: Math.round(25 + Math.sin(i) * 15 + Math.random() * 5),
        memory: Math.round(45 + Math.cos(i) * 10 + Math.random() * 4),
        network: Math.round(120 + Math.sin(i * 0.5) * 40),
      }
    })
    return { service_metrics: times } as T
  }
  if (clean === '/observability/logs') {
    return {
      logs: [
        { timestamp: new Date().toISOString(), level: 'INFO', service: 'claims-api', message: 'Claims batch processed: 142 records adjudicated without error' },
        { timestamp: new Date(Date.now() - 15000).toISOString(), level: 'WARN', service: 'pharmacy-service', message: 'DB connection latency: 180.5ms > 100ms threshold' },
        { timestamp: new Date(Date.now() - 30000).toISOString(), level: 'INFO', service: 'identity-service', message: 'OAuth 2.0 PKCE token issued for user admin' },
        { timestamp: new Date(Date.now() - 45000).toISOString(), level: 'INFO', service: 'notification-service', message: 'Dispatched encrypted SMS alert payload to provider pool' },
        { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'INFO', service: 'database-service', message: 'Replication sync complete: 0 lag across primary secondaries' },
      ],
    } as T
  }
  if (clean === '/observability/traces') {
    return {
      traces: [
        {
          trace_id: 'tr-001',
          service: 'claims-api',
          endpoint: 'POST /v1/claims',
          duration_ms: 45,
          status: 'ok',
          spans: [
            { service: 'claims-api', operation: 'HTTP POST /v1/claims', duration_ms: 45 },
            { service: 'identity-service', operation: 'JWT Token Verify', duration_ms: 12 },
            { service: 'database-service', operation: 'Insert Claim Record', duration_ms: 28 },
          ],
        },
        {
          trace_id: 'tr-002',
          service: 'pharmacy-service',
          endpoint: 'GET /v1/prescriptions',
          duration_ms: 180,
          status: 'error',
          spans: [
            { service: 'pharmacy-service', operation: 'GET /v1/prescriptions', duration_ms: 180 },
            { service: 'database-service', operation: 'Pool Connection Acquire (Blocked)', duration_ms: 165 },
          ],
        },
        {
          trace_id: 'tr-003',
          service: 'provider-portal',
          endpoint: 'GET /v1/providers',
          duration_ms: 32,
          status: 'ok',
          spans: [
            { service: 'provider-portal', operation: 'GET /v1/providers', duration_ms: 32 },
            { service: 'identity-service', operation: 'Session Cache Check', duration_ms: 8 },
          ],
        },
      ],
    } as T
  }

  // Infrastructure Telemetry
  if (clean === '/infrastructure/metrics' || clean === '/infrastructure') {
    return {
      cpu: { percent: 34.2, count: 8 },
      memory: { percent: 58.4, total_gb: 16.0, used_gb: 9.3, available_gb: 6.7 },
      disk: { percent: 45.1, total_gb: 512.0, free_gb: 281.0 },
      network: { bytes_sent_mb: 184.2, bytes_recv_mb: 492.6 },
      processes: [
        { pid: 1042, name: 'uvicorn (fastapi-backend)', cpu_percent: 2.1, memory_percent: 4.8, status: 'running' },
        { pid: 1088, name: 'python (simulator)', cpu_percent: 1.8, memory_percent: 3.2, status: 'running' },
        { pid: 1104, name: 'python (monitoring-agent)', cpu_percent: 0.9, memory_percent: 1.5, status: 'running' },
        { pid: 1210, name: 'postgres: 16-alpine', cpu_percent: 3.4, memory_percent: 6.2, status: 'running' },
        { pid: 1250, name: 'prometheus: latest', cpu_percent: 1.2, memory_percent: 2.9, status: 'running' },
      ],
    } as T
  }

  // Immutable Audit Logs
  if (clean === '/audit') {
    return MOCK_AUDIT_LOGS as T
  }

  // AI Evaluation Benchmark Suite
  if (clean === '/evaluation/test-cases') {
    return [
      {
        id: 'tc-1',
        name: 'Claims API CPU Saturation',
        description: 'P95 latency elevated over 3 seconds during batch claims adjudication',
        expected_root_cause: 'Unbounded loop in batch claims processing parser',
        expected_actions: ['restart_service', 'scale_up_replicas'],
        synthetic_incident: { severity: 'CRITICAL' },
      },
      {
        id: 'tc-2',
        name: 'Pharmacy Connection Pool Exhaustion',
        description: 'All 100 database connections saturated with hung worker threads',
        expected_root_cause: 'Connection leak in prescription formulary lookup query',
        expected_actions: ['flush_connection_pool', 'restart_service'],
        synthetic_incident: { severity: 'HIGH' },
      },
      {
        id: 'tc-3',
        name: 'Provider Portal Transient 502',
        description: 'Upstream worker process killed by operating system OOM killer',
        expected_root_cause: 'Memory leak during large provider roster query',
        expected_actions: ['rollback_deployment', 'clear_cache'],
        synthetic_incident: { severity: 'MEDIUM' },
      },
      {
        id: 'tc-4',
        name: 'Identity Service OAuth Token Timeout',
        description: 'Token verification latency exceeded 250ms SLA boundary',
        expected_root_cause: 'Cache miss storm following Redis replica restart',
        expected_actions: ['clear_cache', 'scale_up_replicas'],
        synthetic_incident: { severity: 'MEDIUM' },
      },
    ] as T
  }
  if (clean === '/evaluation/runs') {
    return [
      {
        id: 1,
        started_at: new Date(Date.now() - 3600000).toISOString(),
        completed_at: new Date(Date.now() - 3500000).toISOString(),
        model_name: 'llama3.2',
        total_cases: 4,
        correct_root_causes: 4,
        avg_evidence_score: 0.94,
        unsafe_action_count: 0,
      },
      {
        id: 2,
        started_at: new Date(Date.now() - 86400000).toISOString(),
        completed_at: new Date(Date.now() - 86300000).toISOString(),
        model_name: 'llama3.2',
        total_cases: 4,
        correct_root_causes: 3,
        avg_evidence_score: 0.88,
        unsafe_action_count: 0,
      },
    ] as T
  }
  if (clean === '/evaluation/run') {
    return { run_id: 3, status: 'COMPLETED', accuracy_score: 95.0 } as T
  }

  return undefined
}
