import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { SeverityBadge, StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDate, formatDuration } from '../lib/utils'
import { ArrowLeft, Bot, Clock, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'

const STATUSES = ['OPEN', 'INVESTIGATING', 'ACKNOWLEDGED', 'REMEDIATION_PENDING', 'RESOLVED', 'CLOSED']

export function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [statusVal, setStatusVal] = useState('')

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => api.get<any>(`/incidents/${id}`),
    refetchInterval: 10000,
  })

  const update = useMutation({
    mutationFn: (body: any) => api.patch(`/incidents/${id}`, body),
    onSuccess: () => {
      toast.success('Incident status updated')
      qc.invalidateQueries({ queryKey: ['incident', id] })
    },
    onError: (e: any) => toast.error(e.message || 'Status update failed'),
  })

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-[var(--muted)]">
        Loading incident dossier #{id?.slice(0, 8)}...
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="py-24 text-center space-y-3">
        <AlertOctagon size={40} className="mx-auto text-[#c64545]" />
        <h2 className="text-xl font-medium text-[var(--ink)]">Incident Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/incidents')}>
          Return to Incidents
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors mt-1"
            title="Back to incident list"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono text-[var(--muted)]">INC-{incident.id.slice(0, 8)}</span>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              {incident.service_name && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--surface-card)] border border-[var(--hairline)] text-[var(--body)]">
                  svc: {incident.service_name}
                </span>
              )}
            </div>

            <h1
              className="text-3xl font-normal text-[var(--ink)] tracking-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {incident.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono text-[var(--muted)] mt-1.5">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Detected {formatDate(incident.detected_at)}
              </span>
              <span>·</span>
              <span>Duration: {formatDuration(incident.detected_at, incident.resolved_at)}</span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/ai-investigation?incident_id=${id}`)}
          >
            <Bot size={15} />
            <span>Launch AI Diagnosis</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Dossier & Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Description & Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Description</CardTitle>
            </CardHeader>
            <p className="text-sm text-[var(--body)] leading-relaxed font-sans">
              {incident.description || 'No detailed description logged for this anomaly.'}
            </p>

            {/* Evidence Badges */}
            {incident.evidence && Object.keys(incident.evidence).length > 0 && (
              <div className="mt-6 pt-6 border-t border-[var(--hairline)]">
                <div className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider mb-3">
                  Telemetry Evidence Signals
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(incident.evidence).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3 bg-[var(--surface-soft)] rounded-lg border border-[var(--hairline)]"
                    >
                      <div className="text-[11px] font-mono text-[var(--muted)] uppercase truncate">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm font-semibold text-[var(--ink)] mt-0.5 font-mono">
                        {String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Root Cause Analysis (if present) */}
          {incident.root_cause_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
                <CardDescription>Synthesized from diagnostics and runbook execution</CardDescription>
              </CardHeader>
              <div className="p-4 bg-[var(--surface-soft)] rounded-lg border border-[var(--hairline)] text-sm text-[var(--body)] leading-relaxed">
                {incident.root_cause_notes}
              </div>
            </Card>
          )}

          {/* Incident Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Timeline</CardTitle>
              <CardDescription>Chronological sequence of detection, triage, and resolution events</CardDescription>
            </CardHeader>

            {!incident.events?.length ? (
              <p className="text-sm text-[var(--muted)] py-4">No timeline events recorded yet.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {incident.events.map((e: any, index: number) => (
                  <div key={e.id || index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] mt-1 flex-shrink-0" />
                      {index < incident.events.length - 1 && (
                        <div className="w-px flex-1 bg-[var(--hairline)] my-1" />
                      )}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[var(--surface-soft)] text-[var(--ink)] border border-[var(--hairline)]">
                          {e.event_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--muted)]">
                          {formatDate(e.occurred_at)}
                        </span>
                      </div>
                      {e.description && (
                        <p className="text-xs text-[var(--body)] mt-1 leading-relaxed">
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Operational Controls & State Transitions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Transition</CardTitle>
              <CardDescription>Update incident lifecycle state</CardDescription>
            </CardHeader>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-[var(--muted)]">Current State</label>
              <select
                value={statusVal || incident.status}
                onChange={(e) => setStatusVal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[var(--surface-soft)] text-[var(--ink)] border border-[var(--hairline)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                className="w-full mt-2"
                loading={update.isPending}
                disabled={!statusVal || statusVal === incident.status}
                onClick={() => update.mutate({ status: statusVal })}
              >
                Apply State Transition
              </Button>
            </div>
          </Card>

          {/* Quick Info Box */}
          <div className="p-4 bg-[var(--surface-soft)] rounded-xl border border-[var(--hairline)] text-xs space-y-2">
            <div className="font-medium text-[var(--ink)] uppercase tracking-wider text-[10px]">
              Platform Guardrail
            </div>
            <p className="text-[var(--muted)] leading-relaxed">
              Automated remediations require human approval before execution if labeled as HIGH risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
