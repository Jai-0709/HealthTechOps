import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { MetricCard } from '../components/ui/MetricCard'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { ShieldCheck, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { cn } from '../lib/utils'

interface SLOStatus {
  service_name: string
  slug: string
  availability_target: number
  availability_actual: number
  latency_target_ms: number
  latency_actual_ms: number
  error_budget_remaining: number
  error_budget_total: number
  error_budget_pct_remaining: number
  is_meeting_slo: boolean
  window_days: number
}

interface MTTxMetrics {
  mttd_minutes: number
  mttr_minutes: number
  total_resolved: number
  total_incidents: number
}

function ErrorBudgetBar({ pct }: { pct: number }) {
  const color =
    pct >= 50
      ? 'bg-emerald-500'
      : pct >= 20
      ? 'bg-amber-500'
      : 'bg-rose-500'

  return (
    <div className="flex items-center gap-2.5 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-[var(--canvas)] border border-[var(--hairline)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium text-[var(--ink)] tabular-nums">
        {pct.toFixed(1)}%
      </span>
    </div>
  )
}

function ComplianceBadge({ isMeeting }: { isMeeting: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border select-none',
        isMeeting
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          isMeeting ? 'bg-emerald-500' : 'bg-rose-500'
        )}
      />
      <span>{isMeeting ? 'Compliant' : 'Breaching'}</span>
    </span>
  )
}

export function Reliability() {
  const { data: sloList = [], isLoading: sloLoading } = useQuery<SLOStatus[]>({
    queryKey: ['slo'],
    queryFn: () => api.get<SLOStatus[]>('/slo'),
    refetchInterval: 30000,
  })

  const { data: mttx, isLoading: mttxLoading } = useQuery<MTTxMetrics>({
    queryKey: ['slo-mttx'],
    queryFn: () => api.get<MTTxMetrics>('/slo/mttd-mttr'),
    refetchInterval: 30000,
  })

  const meetingSLO = sloList.filter((s) => s.is_meeting_slo).length
  const breaching = sloList.length - meetingSLO

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Service Level Objectives · 30-Day Rolling Window
          </div>
          <h1
            className="text-2xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Reliability &amp; SLO Management
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Availability objectives, latency percentiles, error budget depletion tracking, and incident MTTR benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
          <span>Active Window: 30 Days</span>
        </div>
      </div>

      {/* KPI Metric Cards (2x2 on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricCard
          title="Services Meeting SLO"
          value={sloLoading ? '—' : `${meetingSLO} / ${sloList.length}`}
          unit="services"
          icon={<ShieldCheck className="w-4 h-4" />}
          trend={breaching === 0 ? 'up' : 'down'}
          trendValue={breaching === 0 ? '100% compliant' : `${breaching} breaching target`}
          status={breaching === 0 ? 'healthy' : 'critical'}
        />
        <MetricCard
          title="Mean Time to Detect (MTTD)"
          value={mttxLoading ? '—' : `${mttx?.mttd_minutes?.toFixed(1) ?? '—'}`}
          unit="min"
          icon={<Clock className="w-4 h-4" />}
          trendValue="Automated alert latency"
          status="neutral"
        />
        <MetricCard
          title="Mean Time to Resolve (MTTR)"
          value={mttxLoading ? '—' : `${mttx?.mttr_minutes?.toFixed(1) ?? '—'}`}
          unit="min"
          icon={<AlertTriangle className="w-4 h-4" />}
          trendValue="Incident remediation cycle"
          status={mttx && mttx.mttr_minutes > 60 ? 'warning' : 'healthy'}
        />
        <MetricCard
          title="Resolved Incidents"
          value={mttxLoading ? '—' : String(mttx?.total_resolved ?? '—')}
          unit={`of ${mttx?.total_incidents ?? '—'} total`}
          icon={<TrendingUp className="w-4 h-4" />}
          status="neutral"
        />
      </div>

      {/* SLO Targets & Error Budgets */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Microservice SLO Portfolio &amp; Error Budgets</CardTitle>
            <CardDescription>
              Availability targets, actual uptime, and error budget burn rate over 30 days
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">
            {sloList.length} microservices monitored
          </span>
        </CardHeader>

        {sloLoading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading SLO telemetry...</div>
        ) : (
          <>
            {/* Mobile SLO Cards */}
            <div className="md:hidden space-y-3 pt-2">
              {sloList.map((slo) => (
                <div key={slo.slug} className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-soft)] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm text-[var(--ink)] leading-snug">
                        {slo.service_name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5">
                        {slo.slug}
                      </div>
                    </div>
                    <ComplianceBadge isMeeting={slo.is_meeting_slo} />
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--muted)]">Error Budget Remaining:</span>
                    </div>
                    <ErrorBudgetBar pct={slo.error_budget_pct_remaining} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--hairline)] text-xs">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--muted)]">Uptime</div>
                      <div className="font-mono font-medium text-[var(--ink)] mt-0.5">
                        {slo.availability_actual.toFixed(2)}% <span className="text-[10px] text-[var(--muted)] font-normal">/ {slo.availability_target.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--muted)]">Latency P95</div>
                      <div className="font-mono font-medium text-[var(--ink)] mt-0.5">
                        {slo.latency_actual_ms.toFixed(0)}ms <span className="text-[10px] text-[var(--muted)] font-normal">/ &lt;{slo.latency_target_ms}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop SLO Table */}
            <div className="hidden md:block">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Service</Th>
                    <Th>Availability Target</Th>
                    <Th>Actual Availability</Th>
                    <Th>Latency P95 Target</Th>
                    <Th>Actual P95</Th>
                    <Th>Error Budget Remaining</Th>
                    <Th>Compliance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sloList.map((slo) => (
                    <Tr key={slo.slug}>
                      <Td>
                        <div className="font-medium text-[var(--ink)] leading-snug">
                          {slo.service_name}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">
                          {slo.slug}
                        </div>
                      </Td>
                      <Td className="font-mono text-xs text-[var(--body)]">
                        {slo.availability_target.toFixed(2)}%
                      </Td>
                      <Td className="font-mono text-xs font-semibold text-[var(--ink)]">
                        {slo.availability_actual.toFixed(2)}%
                      </Td>
                      <Td className="font-mono text-xs text-[var(--muted)]">
                        &lt;{slo.latency_target_ms}ms
                      </Td>
                      <Td className="font-mono text-xs text-[var(--ink)]">
                        {slo.latency_actual_ms.toFixed(0)}ms
                      </Td>
                      <Td>
                        <ErrorBudgetBar pct={slo.error_budget_pct_remaining} />
                      </Td>
                      <Td>
                        <ComplianceBadge isMeeting={slo.is_meeting_slo} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
