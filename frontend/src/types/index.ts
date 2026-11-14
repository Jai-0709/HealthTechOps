export type UserRole = 'ADMIN' | 'SRE_ENGINEER' | 'VIEWER'
export interface User { id: string; email: string; full_name: string; role: UserRole; is_active: boolean; created_at: string }
export interface AuthState { user: User | null; token: string | null; isAuthenticated: boolean; login(e: string, p: string): Promise<void>; logout(): void }
export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN'
export interface Service { id: string; name: string; slug: string; description: string | null; status: ServiceStatus; cpu_percent: number; memory_percent: number; request_count: number; error_count: number; avg_latency_ms: number; uptime_percent: number; last_checked: string | null; port: number | null }
export type IncidentSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'ACKNOWLEDGED' | 'REMEDIATION_PENDING' | 'RESOLVED' | 'CLOSED'
export interface Incident { id: string; title: string; description?: string; severity: IncidentSeverity; status: IncidentStatus; service_id?: string; service_name?: string; detected_at: string; resolved_at?: string; root_cause_notes?: string; evidence?: Record<string, unknown>; events?: IncidentEvent[] }
export interface IncidentEvent { id: number; event_type: string; description?: string; occurred_at: string }
export interface AIInvestigation { id: string; incident_id: string; model_name: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'; root_cause_summary?: string; evidence_items: string[]; recommended_actions: string[]; confidence_score: number; started_at: string; completed_at?: string }
export interface Runbook { id: string; name: string; slug: string; description: string | null; risk_level: 'LOW' | 'MEDIUM' | 'HIGH'; steps: string[]; is_allowlisted: boolean; service_type: string | null; created_at: string }
export interface RemediationRequest { id: string; action_name: string; risk_level: string; status: string; incident_id?: string; requested_at: string; reviewed_at?: string; execution_result?: Record<string, unknown> }
export interface SLOResult { service_id: string; service_name: string; availability_target: number; availability_actual: number; latency_p95_target_ms: number; latency_p95_actual_ms: number; error_rate_target: number; error_rate_actual: number; error_budget_remaining: number; is_meeting_slo: boolean }
export interface AuditLog { id: string; user_email?: string; user_role?: string; action: string; resource_type?: string; resource_id?: string; outcome: string; ip_address?: string; created_at: string }
