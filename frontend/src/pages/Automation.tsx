import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { StatusBadge, Badge, RiskBadge, PolicyBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate } from '../lib/utils'
import { CheckCircle, XCircle, Wrench, ChevronDown, ChevronRight, ShieldAlert, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'

const TABS = ['Runbooks', 'Pending Approvals', 'Execution History'] as const
type Tab = typeof TABS[number]

function RunbookRow({ rb, onExecute, isExecuting }: { rb: any; onExecute(id: string): void; isExecuting: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <Tr onClick={() => setExpanded((e) => !e)}>
        <Td>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown size={14} className="text-[var(--muted)]" />
            ) : (
              <ChevronRight size={14} className="text-[var(--muted)]" />
            )}
            <span className="font-medium text-[var(--ink)]">{rb.name}</span>
          </div>
        </Td>
        <Td>
          <RiskBadge level={rb.risk_level} />
        </Td>
        <Td>
          <PolicyBadge isAllowlisted={rb.is_allowlisted} />
        </Td>
        <Td className="text-xs font-mono text-[var(--muted)]">{rb.service_type || 'all'}</Td>
        <Td>
          <Button
            size="sm"
            variant="outline"
            loading={isExecuting}
            onClick={(e) => {
              e.stopPropagation()
              onExecute(rb.id)
            }}
          >
            <PlayCircle size={13} className="text-[var(--primary)]" />
            <span>Trigger</span>
          </Button>
        </Td>
      </Tr>
      {expanded && (
        <Tr className="bg-[var(--surface-soft)]">
          <Td colSpan={5}>
            <div className="py-3 px-4 space-y-2">
              <p className="text-xs text-[var(--muted)] leading-relaxed">{rb.description}</p>
              <div className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wider">
                Runbook Execution Steps:
              </div>
              <ol className="list-decimal list-inside space-y-1 font-mono text-xs text-[var(--body)] bg-[var(--canvas)] p-3 rounded-lg border border-[var(--hairline)]">
                {rb.steps?.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          </Td>
        </Tr>
      )}
    </>
  )
}

export function Automation() {
  const [tab, setTab] = useState<Tab>('Runbooks')
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: runbooks } = useQuery({
    queryKey: ['runbooks'],
    queryFn: () => api.get<any[]>('/runbooks'),
  })

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['remediation-pending'],
    queryFn: () => api.get<any[]>('/remediation/pending'),
    refetchInterval: 10000,
  })

  const { data: history } = useQuery({
    queryKey: ['remediation-all'],
    queryFn: () => api.get<any[]>('/remediation'),
    refetchInterval: 15000,
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/remediation/${id}/approve`),
    onSuccess: () => {
      toast.success('Remediation approved and executed')
      qc.invalidateQueries({ queryKey: ['remediation-pending'] })
      qc.invalidateQueries({ queryKey: ['remediation-all'] })
    },
    onError: (e: any) => toast.error(e.message || 'Approval failed'),
  })

  const reject = useMutation({
    mutationFn: (id: string) => api.post(`/remediation/${id}/reject`),
    onSuccess: () => {
      toast.success('Remediation rejected')
      qc.invalidateQueries({ queryKey: ['remediation-pending'] })
      qc.invalidateQueries({ queryKey: ['remediation-all'] })
    },
    onError: (e: any) => toast.error(e.message || 'Rejection failed'),
  })

  const executeRunbook = useMutation({
    mutationFn: (runbookId: string) => api.post(`/runbooks/${runbookId}/execute`, {}),
    onSuccess: () => {
      toast.success('Runbook execution requested; queued in Pending Approvals')
      qc.invalidateQueries({ queryKey: ['remediation-pending'] })
      qc.invalidateQueries({ queryKey: ['remediation-all'] })
      setTab('Pending Approvals')
    },
    onError: (e: any) => toast.error(e.message || 'Runbook trigger failed'),
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Human-in-the-Loop Remediation · Guardrailed Runbooks
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Automation &amp; Runbooks
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Pre-approved automated recovery procedures, pending human remediation reviews, and execution audit history.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-xl w-full sm:w-auto overflow-x-auto touch-pan-x">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs rounded-lg transition-all font-medium whitespace-nowrap flex-shrink-0 cursor-pointer ${
                tab === t
                  ? 'bg-[var(--surface-card)] text-[var(--ink)] shadow-xs border border-[var(--hairline)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <span>{t}</span>
              {t === 'Pending Approvals' && (pending?.length ?? 0) > 0 && (
                <span className="w-5 h-5 bg-[#cc785c] text-white text-[11px] rounded-full flex items-center justify-center font-bold">
                  {pending?.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Approvals Notice Banner */}
      {(pending?.length ?? 0) > 0 && tab !== 'Pending Approvals' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-[#e8a55a]" />
            <span>
              <strong>{pending?.length} remediation request(s)</strong> awaiting human SRE review.
            </span>
          </div>
          <button
            onClick={() => setTab('Pending Approvals')}
            className="font-medium underline hover:text-[var(--ink)]"
          >
            Review Queue →
          </button>
        </div>
      )}

      {/* Tab 1: Runbooks */}
      {tab === 'Runbooks' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Standard Operational Runbooks</CardTitle>
              <CardDescription>Deterministic recovery procedures verified against synthetic environment</CardDescription>
            </div>
            <span className="text-xs font-mono text-[var(--muted)]">
              {runbooks?.length ?? 0} available
            </span>
          </CardHeader>
          <Table>
            <Thead>
              <Tr>
                <Th>Runbook Name</Th>
                <Th>Risk Level</Th>
                <Th>Safety Policy</Th>
                <Th>Service Target</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {runbooks?.map((rb) => (
                <RunbookRow
                  key={rb.id}
                  rb={rb}
                  onExecute={(id) => executeRunbook.mutate(id)}
                  isExecuting={executeRunbook.isPending}
                />
              ))}
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Tab 2: Pending Approvals */}
      {tab === 'Pending Approvals' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pending Human Approvals</CardTitle>
              <CardDescription>High-risk actions blocked pending explicit SRE authorization</CardDescription>
            </div>
          </CardHeader>

          {pendingLoading ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">Checking approval queue...</div>
          ) : !pending?.length ? (
            <div className="py-12">
              <EmptyState
                icon={<CheckCircle size={40} className="text-[#5db872] opacity-80" />}
                title="All Clear — Zero Pending Approvals"
                description="No remediation procedures are awaiting review. All current automated actions have completed or require no elevated consent."
              />
            </div>
          ) : user?.role === 'VIEWER' ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-800 dark:text-amber-300">
              Your account has <strong>VIEWER</strong> permissions. SRE_ENGINEER or ADMIN role is required to authorize remediations.
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Remediation Action</Th>
                  <Th>Risk Level</Th>
                  <Th>Linked Incident</Th>
                  <Th>Requested At</Th>
                  <Th>Decision</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pending.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>
                      <div className="font-mono text-xs font-medium text-[var(--ink)]">
                        {r.action_name}
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="danger">{r.risk_level}</Badge>
                    </Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">
                      {r.incident_id ? `INC-${r.incident_id.slice(0, 8)}` : '—'}
                    </Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">
                      {formatDate(r.requested_at)}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          loading={approve.isPending}
                          onClick={() => approve.mutate(r.id)}
                        >
                          <CheckCircle size={13} />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          loading={reject.isPending}
                          onClick={() => reject.mutate(r.id)}
                        >
                          <XCircle size={13} />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      )}

      {/* Tab 3: Execution History */}
      {tab === 'Execution History' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Remediation Execution History</CardTitle>
              <CardDescription>Audit trail of all requested, approved, and executed automated interventions</CardDescription>
            </div>
            <span className="text-xs font-mono text-[var(--muted)]">
              {history?.length ?? 0} total events
            </span>
          </CardHeader>

          {!history?.length ? (
            <div className="py-12">
              <EmptyState
                icon={<Wrench size={40} className="text-[var(--primary)] opacity-80" />}
                title="No Execution History"
                description="Remediations triggered by the AI or operators will appear here."
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Action</Th>
                  <Th>Risk</Th>
                  <Th>Status</Th>
                  <Th>Requested At</Th>
                  <Th>Executed At</Th>
                  <Th>Result Output</Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.map((r: any) => (
                  <Tr key={r.id}>
                    <Td>
                      <span className="font-mono text-xs font-medium text-[var(--ink)]">
                        {r.action_name}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        variant={
                          r.risk_level === 'HIGH'
                            ? 'danger'
                            : r.risk_level === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {r.risk_level}
                      </Badge>
                    </Td>
                    <Td>
                      <StatusBadge status={r.status} />
                    </Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">
                      {formatDate(r.requested_at)}
                    </Td>
                    <Td className="text-xs font-mono text-[var(--muted)]">
                      {formatDate(r.reviewed_at)}
                    </Td>
                    <Td className="text-xs font-mono text-[var(--muted)] max-w-xs truncate">
                      {r.execution_result?.result || '—'}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Card>
      )}
    </div>
  )
}
