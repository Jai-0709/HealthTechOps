// Interactive Self-Healing SRE Demo State Engine for HealthTechOps
// Enables live interview demonstrations of anomaly detection, AI triage, and automated resolution.

export interface DemoScenario {
  id: string
  serviceId: string
  serviceSlug: string
  serviceName: string
  incidentId: string
  incidentTitle: string
  incidentDescription: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  cpu_percent: number
  memory_percent: number
  avg_latency_ms: number
  error_count: number
  root_cause_summary: string
  evidence_items: string[]
  recommended_actions: string[]
  runbookId: string
  remediationAction: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'pharmacy-pool-leak',
    serviceId: '3',
    serviceSlug: 'pharmacy-service',
    serviceName: 'Pharmacy Service',
    incidentId: 'inc-001',
    incidentTitle: 'Pharmacy Service Elevated P95 Latency',
    incidentDescription:
      'P95 latency breached 180ms SLO threshold (target: 100ms). Downstream prescription dispatch affected.',
    severity: 'HIGH',
    cpu_percent: 74.8,
    memory_percent: 68.2,
    avg_latency_ms: 180.5,
    error_count: 45,
    root_cause_summary:
      'Sustained thread blockage observed in connection pooling layer following high-volume prescription batch dispatch. Worker threads reached maximum timeout waiting for idle database connections.',
    evidence_items: [
      'P95 latency elevated to 180.5ms (breached 100ms SLO target)',
      'Active database pool connections saturated at 98% capacity',
      'Prescription dispatch queue backlogged by 320 records',
      'Zero container hardware crashes observed across worker nodes',
    ],
    recommended_actions: ['flush_connection_pool', 'restart_service'],
    runbookId: 'rb-5',
    remediationAction: 'flush_connection_pool',
    riskLevel: 'LOW',
  },
  {
    id: 'claims-cpu-saturation',
    serviceId: '1',
    serviceSlug: 'claims-api',
    serviceName: 'Claims API',
    incidentId: 'inc-002',
    incidentTitle: 'Claims API CPU Saturation & Latency Spike',
    incidentDescription:
      'Unbounded loop in batch claims XML validator causing CPU saturation at 88% and latency spike to 220ms.',
    severity: 'CRITICAL',
    cpu_percent: 88.4,
    memory_percent: 64.1,
    avg_latency_ms: 220.0,
    error_count: 52,
    root_cause_summary:
      'Unbounded processing loop in batch claims XML validator parsing multi-payer payloads. Thread saturation preventing real-time claims adjudication.',
    evidence_items: [
      'CPU utilization peaked at 88.4% across all 4 worker threads',
      'P95 latency elevated to 220ms (target: 100ms)',
      'Downstream provider claims queues backing up by 420 messages/min',
      'Database I/O remains healthy (< 15ms latency)',
    ],
    recommended_actions: ['restart_service', 'scale_up'],
    runbookId: 'rb-1',
    remediationAction: 'restart_service',
    riskLevel: 'MEDIUM',
  },
  {
    id: 'provider-memory-leak',
    serviceId: '2',
    serviceSlug: 'provider-portal',
    serviceName: 'Provider Portal',
    incidentId: 'inc-003',
    incidentTitle: 'Provider Portal Upstream Worker Instability (502s)',
    incidentDescription:
      'Nginx reverse proxy received connection reset from upstream application worker during large roster query.',
    severity: 'HIGH',
    cpu_percent: 48.2,
    memory_percent: 89.1,
    avg_latency_ms: 195.0,
    error_count: 38,
    root_cause_summary:
      'Memory leak during large provider clinic roster synchronization triggered container cgroup memory pressure and worker thread recycling.',
    evidence_items: [
      'HTTP 502 Bad Gateway responses reached 3.8% of inbound traffic',
      'Process memory consumed 89.1% of available container limit',
      'OOM killer signals logged on worker thread #4',
      'Zero database errors observed on primary PostgreSQL node',
    ],
    recommended_actions: ['restart_service', 'rollback_deployment'],
    runbookId: 'rb-4',
    remediationAction: 'restart_service',
    riskLevel: 'MEDIUM',
  },
  {
    id: 'identity-cache-storm',
    serviceId: '4',
    serviceSlug: 'identity-service',
    serviceName: 'Identity Service',
    incidentId: 'inc-004',
    incidentTitle: 'Identity Service Token Verification SLA Breach',
    incidentDescription:
      'Token verification latency exceeded 250ms SLA boundary due to Redis replica cache eviction storm.',
    severity: 'HIGH',
    cpu_percent: 32.5,
    memory_percent: 45.0,
    avg_latency_ms: 165.0,
    error_count: 19,
    root_cause_summary:
      'Redis session cache miss storm following replica restart, causing all OAuth 2.0 PKCE verification requests to hit disk database directly.',
    evidence_items: [
      'OAuth token verification latency rose from 22ms to 165ms',
      'Cache hit ratio plummeted from 99.4% to 12.1%',
      'SLA breach: authentication response time > 150ms limit',
      'Underlying PostgreSQL replica connection count spiked 3x',
    ],
    recommended_actions: ['clear_cache', 'restart_service'],
    runbookId: 'rb-2',
    remediationAction: 'clear_cache',
    riskLevel: 'LOW',
  },
]

export const BASE_SERVICES = [
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
    port: 8011,
  },
  {
    id: '3',
    name: 'Pharmacy Service',
    slug: 'pharmacy-service',
    description: 'Digital prescription routing and pharmacy formulary engine',
    status: 'HEALTHY',
    cpu_percent: 31.2,
    memory_percent: 48.0,
    request_count: 8100,
    error_count: 5,
    avg_latency_ms: 48.5,
    uptime_percent: 99.96,
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
    port: 8015,
  },
]

// Determine initial scenario and state
function createDefaultPendingList(scenario: DemoScenario): any[] {
  return [
    {
      id: `rem-${scenario.incidentId}-${scenario.remediationAction}`,
      action_name: scenario.remediationAction,
      incident_id: scenario.incidentId,
      risk_level: scenario.riskLevel,
      status: 'PENDING_APPROVAL',
      requested_at: new Date(Date.now() - 5 * 60000).toISOString(),
      requested_by: 'admin@healthtechops.local',
    },
  ]
}

function initializeDemoState(): {
  scenarioIdx: number
  isResolved: boolean
  pendingRemediations: any[]
  history: any[]
} {
  const isReload =
    typeof performance !== 'undefined' &&
    performance.getEntriesByType &&
    performance.getEntriesByType('navigation')[0] &&
    (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type === 'reload'

  let storedIdx = 0
  let storedResolved = false
  let storedPending: any[] | null = null

  try {
    const rawIdx = sessionStorage.getItem('healthtechops_scenario_idx')
    const rawRes = sessionStorage.getItem('healthtechops_is_resolved')
    const rawPending = sessionStorage.getItem('healthtechops_pending_remediations')
    if (rawIdx !== null) storedIdx = parseInt(rawIdx, 10) || 0
    if (rawRes !== null) storedResolved = rawRes === 'true'
    if (rawPending !== null) storedPending = JSON.parse(rawPending)
  } catch {}

  let nextIdx = storedIdx
  let nextResolved = storedResolved

  if (isReload || storedResolved) {
    nextIdx = (storedIdx + 1) % DEMO_SCENARIOS.length
    nextResolved = false
    storedPending = null
  }

  const scenario = DEMO_SCENARIOS[nextIdx % DEMO_SCENARIOS.length]
  const pending = storedPending || createDefaultPendingList(scenario)

  try {
    sessionStorage.setItem('healthtechops_scenario_idx', nextIdx.toString())
    sessionStorage.setItem('healthtechops_is_resolved', nextResolved ? 'true' : 'false')
    sessionStorage.setItem('healthtechops_pending_remediations', JSON.stringify(pending))
  } catch {}

  return {
    scenarioIdx: nextIdx,
    isResolved: nextResolved,
    pendingRemediations: pending,
    history: [],
  }
}

// Global Demo State in JavaScript runtime
let demoState = initializeDemoState()

function saveDemoState() {
  try {
    sessionStorage.setItem('healthtechops_scenario_idx', demoState.scenarioIdx.toString())
    sessionStorage.setItem('healthtechops_is_resolved', demoState.isResolved ? 'true' : 'false')
    sessionStorage.setItem(
      'healthtechops_pending_remediations',
      JSON.stringify(demoState.pendingRemediations)
    )
  } catch {}
}

export function getDemoState() {
  return demoState
}

export function getCurrentScenario(): DemoScenario {
  return DEMO_SCENARIOS[demoState.scenarioIdx % DEMO_SCENARIOS.length]
}

// Add a new remediation action to the pending queue (e.g. from AI triage recommendations)
export function addPendingRemediation(actionName: string, incidentId?: string, riskLevel?: string) {
  const scenario = getCurrentScenario()
  const incId = incidentId || scenario.incidentId
  const cleanAction = actionName.trim()
  const id = `rem-${cleanAction.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}-${incId}`

  // If already queued, return it
  const existing = demoState.pendingRemediations.find(
    (r) => r.id === id || (r.action_name === cleanAction && r.incident_id === incId)
  )
  if (existing) {
    return existing
  }

  const determinedRisk =
    riskLevel === 'HIGH' || riskLevel === 'MEDIUM' || riskLevel === 'LOW'
      ? riskLevel
      : cleanAction.includes('restart') || cleanAction.includes('rollback') || cleanAction.includes('drain')
      ? 'MEDIUM'
      : 'LOW'

  const newRem = {
    id,
    action_name: cleanAction,
    incident_id: incId,
    risk_level: determinedRisk,
    status: 'PENDING_APPROVAL',
    requested_at: new Date().toISOString(),
    requested_by: 'admin@healthtechops.local',
  }

  demoState.pendingRemediations.push(newRem)
  saveDemoState()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('healthtechops-state-changed'))
  }

  return newRem
}

// Approve a specific pending remediation
export function approvePendingRemediation(remediationId: string) {
  const scenario = getCurrentScenario()
  const idx = demoState.pendingRemediations.findIndex(
    (r) => r.id === remediationId || r.action_name === remediationId
  )
  let item = null
  if (idx !== -1) {
    item = demoState.pendingRemediations.splice(idx, 1)[0]
  }

  const actionName = item?.action_name || remediationId || scenario.remediationAction

  demoState.history.unshift({
    id: `rem-exec-${Date.now()}`,
    action_name: actionName,
    status: 'COMPLETED',
    risk_level: item?.risk_level || scenario.riskLevel,
    incident_id: item?.incident_id || scenario.incidentId,
    requested_at: item?.requested_at || new Date(Date.now() - 60000).toISOString(),
    executed_at: new Date().toISOString(),
    recovery_verified: true,
    result: {
      action: actionName,
      service: scenario.serviceName,
      status: 'SUCCESS',
      telemetry: 'All SLO thresholds normalized. Error rate 0.00%. Latency normal.',
    },
  })

  // Heal microservice and incident
  demoState.isResolved = true
  saveDemoState()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('healthtechops-state-changed'))
  }

  return { success: true, status: 'APPROVED', executed: true, action_name: actionName }
}

// Reject a pending remediation
export function rejectPendingRemediation(remediationId: string) {
  const idx = demoState.pendingRemediations.findIndex(
    (r) => r.id === remediationId || r.action_name === remediationId
  )
  if (idx !== -1) {
    const item = demoState.pendingRemediations.splice(idx, 1)[0]
    demoState.history.unshift({
      id: `rem-rej-${Date.now()}`,
      action_name: item.action_name,
      status: 'REJECTED',
      risk_level: item.risk_level,
      incident_id: item.incident_id,
      requested_at: item.requested_at,
      executed_at: new Date().toISOString(),
      recovery_verified: false,
      result: {
        action: item.action_name,
        status: 'REJECTED_BY_OPERATOR',
      },
    })
    saveDemoState()
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('healthtechops-state-changed'))
  }

  return { success: true, status: 'REJECTED', executed: false }
}

// Manually trigger or rotate to the next degradation scenario (e.g. from UI button)
export function triggerSimulateAnomaly(specificIndex?: number): DemoScenario {
  if (typeof specificIndex === 'number') {
    demoState.scenarioIdx = specificIndex % DEMO_SCENARIOS.length
  } else {
    demoState.scenarioIdx = (demoState.scenarioIdx + 1) % DEMO_SCENARIOS.length
  }
  demoState.isResolved = false
  const nextScenario = DEMO_SCENARIOS[demoState.scenarioIdx % DEMO_SCENARIOS.length]
  demoState.pendingRemediations = createDefaultPendingList(nextScenario)
  saveDemoState()

  // Dispatch custom window event so listeners can re-query
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('healthtechops-state-changed'))
  }

  return getCurrentScenario()
}

// Heal all services & resolve the active incident
export function resolveCurrentAnomaly(actionName?: string): void {
  demoState.isResolved = true
  const scenario = getCurrentScenario()

  // Remove matching pending item if any
  const act = actionName || scenario.remediationAction
  const pIdx = demoState.pendingRemediations.findIndex((r) => r.action_name === act)
  if (pIdx !== -1) {
    demoState.pendingRemediations.splice(pIdx, 1)
  }

  demoState.history.unshift({
    id: `rem-exec-${Date.now()}`,
    action_name: act,
    status: 'COMPLETED',
    risk_level: scenario.riskLevel,
    incident_id: scenario.incidentId,
    requested_at: new Date(Date.now() - 60000).toISOString(),
    executed_at: new Date().toISOString(),
    recovery_verified: true,
    result: {
      action: act,
      service: scenario.serviceName,
      status: 'SUCCESS',
      telemetry: 'All SLO thresholds normalized. Error rate 0.00%.',
    },
  })

  saveDemoState()

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('healthtechops-state-changed'))
  }
}

// Get Services List: Exactly 1 degraded when !isResolved, or all 6 Healthy when isResolved
export function getDemoServices() {
  const scenario = getCurrentScenario()
  return BASE_SERVICES.map((s) => {
    if (!demoState.isResolved && s.id === scenario.serviceId) {
      return {
        ...s,
        status: 'DEGRADED',
        cpu_percent: scenario.cpu_percent,
        memory_percent: scenario.memory_percent,
        avg_latency_ms: scenario.avg_latency_ms,
        error_count: scenario.error_count,
        last_checked: new Date().toISOString(),
      }
    }
    return {
      ...s,
      status: 'HEALTHY',
      last_checked: new Date().toISOString(),
    }
  })
}

// Get Overview Dashboard Summary
export function getDemoOverview() {
  const scenario = getCurrentScenario()
  const isHealthy = demoState.isResolved

  const recent_incidents = [
    {
      id: scenario.incidentId,
      title: scenario.incidentTitle,
      severity: scenario.severity,
      status: isHealthy ? 'RESOLVED' : 'INVESTIGATING',
      detected_at: new Date(Date.now() - 35 * 60000).toISOString(),
      resolved_at: isHealthy ? new Date().toISOString() : undefined,
      service_id: scenario.serviceId,
      service_name: scenario.serviceName,
    },
    {
      id: 'inc-hist-01',
      title: 'Provider Portal Transient 502 Bad Gateway',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      detected_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 23 * 3600000).toISOString(),
      service_id: '2',
      service_name: 'Provider Portal',
    },
    {
      id: 'inc-hist-02',
      title: 'Claims API Spike in 429 Rate Limits',
      severity: 'LOW',
      status: 'CLOSED',
      detected_at: new Date(Date.now() - 72 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 71 * 3600000).toISOString(),
      service_id: '1',
      service_name: 'Claims API',
    },
  ]

  return {
    services: {
      total: 6,
      healthy: isHealthy ? 6 : 5,
      degraded: isHealthy ? 0 : 1,
      down: 0,
    },
    incidents: {
      open: isHealthy ? 0 : 1,
      critical: !isHealthy && scenario.severity === 'CRITICAL' ? 1 : 0,
    },
    system_health: isHealthy ? 'HEALTHY' : 'DEGRADED',
    recent_incidents,
  }
}

// Get Incidents List
export function getDemoIncidents() {
  const scenario = getCurrentScenario()
  const isHealthy = demoState.isResolved

  const activeIncident = {
    id: scenario.incidentId,
    title: scenario.incidentTitle,
    description: scenario.incidentDescription,
    severity: scenario.severity,
    status: isHealthy ? 'RESOLVED' : 'INVESTIGATING',
    service_id: scenario.serviceId,
    service_name: scenario.serviceName,
    detected_at: new Date(Date.now() - 35 * 60000).toISOString(),
    resolved_at: isHealthy ? new Date().toISOString() : undefined,
    root_cause_notes: scenario.root_cause_summary,
    evidence: {
      p95_latency_ms: scenario.avg_latency_ms,
      cpu_percent: scenario.cpu_percent,
      error_count: scenario.error_count,
    },
    events: [
      {
        id: 1,
        event_type: 'ALERT_TRIGGERED',
        description: `Telemetry threshold breached on ${scenario.serviceName}`,
        occurred_at: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: 2,
        event_type: 'AI_INVESTIGATION_STARTED',
        description: 'Autonomous triage agent dispatched investigation to local Ollama engine',
        occurred_at: new Date(Date.now() - 33 * 60000).toISOString(),
      },
      {
        id: 3,
        event_type: 'HYPOTHESIS_FORMED',
        description: `Hypothesis formed: ${scenario.root_cause_summary.slice(0, 75)}... (Confidence: 94%)`,
        occurred_at: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      ...(isHealthy
        ? [
            {
              id: 4,
              event_type: 'REMEDIATION_EXECUTED',
              description: `Remediation action '${scenario.remediationAction}' verified: all 6 microservices healthy`,
              occurred_at: new Date().toISOString(),
            },
          ]
        : []),
    ],
  }

  const pastIncidents = [
    {
      id: 'inc-hist-01',
      title: 'Provider Portal Transient 502 Bad Gateway',
      description: 'Nginx reverse proxy received connection reset from upstream application worker.',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      service_id: '2',
      service_name: 'Provider Portal',
      detected_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 23 * 3600000).toISOString(),
    },
    {
      id: 'inc-hist-02',
      title: 'Claims API Spike in 429 Rate Limits',
      description: 'Inbound payer payload burst triggered rate limiter token depletion.',
      severity: 'LOW',
      status: 'CLOSED',
      service_id: '1',
      service_name: 'Claims API',
      detected_at: new Date(Date.now() - 72 * 3600000).toISOString(),
      resolved_at: new Date(Date.now() - 71 * 3600000).toISOString(),
    },
  ]

  return [activeIncident, ...pastIncidents]
}

// Get AI Investigation Result
export function getDemoInvestigation(invId?: string, incId?: string) {
  const scenario = getCurrentScenario()
  return {
    id: invId || 'inv-demo',
    investigation_id: invId || 'inv-demo',
    incident_id: incId || scenario.incidentId,
    model_name: 'llama3.2',
    status: 'COMPLETED',
    confidence_score: 0.94,
    root_cause_summary: scenario.root_cause_summary,
    evidence_items: scenario.evidence_items,
    recommended_actions: scenario.recommended_actions,
    started_at: new Date(Date.now() - 10 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 9 * 60000).toISOString(),
  }
}

// Get Pending Remediation Queue
export function getDemoPendingRemediations() {
  return demoState.pendingRemediations
}

// Get Remediation History
export function getDemoRemediationHistory() {
  return [
    ...demoState.history,
    {
      id: 'rem-hist-01',
      action_name: 'restart_service',
      status: 'COMPLETED',
      risk_level: 'MEDIUM',
      incident_id: 'inc-hist-01',
      requested_at: new Date(Date.now() - 86400000).toISOString(),
      executed_at: new Date(Date.now() - 86350000).toISOString(),
      recovery_verified: true,
      result: {
        action: 'restart_service',
        status: 'SUCCESS',
        note: 'Pod restarted and healthy',
      },
    },
  ]
}
