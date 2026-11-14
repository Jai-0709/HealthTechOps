import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { MetricCard } from '../components/ui/MetricCard'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { SeverityBadge, StatusBadge } from '../components/ui/Badge'
import { formatDate } from '../lib/utils'
import { Server, AlertTriangle, Activity, CheckCircle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react'

export function Overview() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api.get<any>('/overview'),
    refetchInterval: 15000,
  })

  const sv = data?.services
  const ic = data?.incidents
  const health: 'healthy' | 'warning' | 'critical' | 'neutral' =
    data?.system_health === 'HEALTHY'
      ? 'healthy'
      : data?.system_health === 'DEGRADED'
      ? 'warning'
      : data?.system_health
      ? 'critical'
      : 'neutral'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            IEDP Portfolio · Autonomous Operations
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Operations Overview
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Real-time platform telemetry, synthetic microservice topology, and active incidents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/ai-investigation')}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[var(--surface-dark)] text-[var(--on-dark)] hover:bg-[var(--surface-dark-elevated)] border border-[var(--hairline)] transition-colors inline-flex items-center gap-2"
          >
            <Cpu size={14} className="text-[var(--primary)]" />
            <span>AI Triage Console</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          loading={isLoading}
          title="Total Services"
          value={sv?.total ?? '—'}
          unit="microservices"
          icon={<Server size={18} />}
          status="neutral"
        />
        <MetricCard
          loading={isLoading}
          title="Healthy Services"
          value={sv?.healthy ?? '—'}
          icon={<CheckCircle size={18} />}
          status={sv?.down > 0 ? 'critical' : sv?.degraded > 0 ? 'warning' : 'healthy'}
          trend={sv?.healthy === sv?.total ? 'up' : 'down'}
          trendValue={sv?.total ? `${((sv.healthy / sv.total) * 100).toFixed(0)}% available` : undefined}
        />
        <MetricCard
          loading={isLoading}
          title="Open Incidents"
          value={ic?.open ?? '—'}
          icon={<AlertTriangle size={18} />}
          status={ic?.critical > 0 ? 'critical' : ic?.open > 0 ? 'warning' : 'healthy'}
          trendValue={ic?.critical > 0 ? `${ic.critical} critical severity` : 'Zero critical'}
        />
        <MetricCard
          loading={isLoading}
          title="System Health"
          value={data?.system_health ?? '—'}
          icon={<Activity size={18} />}
          status={health}
          trendValue="Automated probe cycle"
        />
      </div>

      {/* Content Grid: Service Breakdown & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Breakdown */}
        {sv && (
          <Card>
            <CardHeader>
              <CardTitle>Microservice Health</CardTitle>
              <CardDescription>Real-time status across 6 synthetic services</CardDescription>
            </CardHeader>
            <div className="space-y-4 pt-2">
              {[
                { label: 'Healthy', v: sv.healthy, c: 'bg-[#5db872]', text: 'text-[#2e7d32] dark:text-[#81c784]' },
                { label: 'Degraded', v: sv.degraded, c: 'bg-[#e8a55a]', text: 'text-[#b25e00] dark:text-[#ffb74d]' },
                { label: 'Down', v: sv.down, c: 'bg-[#c64545]', text: 'text-[#c64545] dark:text-[#ef5350]' },
              ].map((i) => (
                <div key={i.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-[var(--body)] font-medium">
                      <span className={`w-2 h-2 rounded-full ${i.c}`} />
                      {i.label}
                    </span>
                    <span className={`font-mono font-medium ${i.text}`}>
                      {i.v} / {sv.total}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--hairline)]">
                    <div
                      className={`h-full ${i.c} rounded-full transition-all duration-500`}
                      style={{ width: `${sv.total ? (i.v / sv.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[var(--hairline)]">
                <button
                  onClick={() => navigate('/services')}
                  className="w-full py-2 px-3 text-xs font-medium text-[var(--primary)] hover:bg-[var(--surface-soft)] rounded-lg transition-colors flex items-center justify-between group"
                >
                  <span>Inspect all services &amp; endpoints</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Incidents Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent Incident Stream</CardTitle>
              <CardDescription>Live telemetry-triggered alerts &amp; anomalies</CardDescription>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <span>View full log</span>
              <ArrowRight size={12} />
            </button>
          </CardHeader>

          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-12 bg-[var(--surface-soft)] rounded-lg" />
              ))}
            </div>
          ) : !data?.recent_incidents?.length ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              <ShieldCheck size={36} className="mx-auto mb-2 text-[#5db872] opacity-80" />
              <p className="font-medium text-[var(--ink)]">Zero Active Incidents</p>
              <p className="text-xs text-[var(--muted)] mt-1">All synthetic microservices are operating normally within SLO thresholds.</p>
            </div>
          ) : (
            <>
              {/* Mobile Recent Incidents Cards (Senior Mobile UX) */}
              <div className="md:hidden space-y-2.5 pt-2">
                {data.recent_incidents.map((i: any) => (
                  <div
                    key={i.id}
                    onClick={() => navigate(`/incidents/${i.id}`)}
                    className="p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-soft)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <SeverityBadge severity={i.severity} />
                        <StatusBadge status={i.status} />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--muted)]">
                        {formatDate(i.detected_at)}
                      </span>
                    </div>
                    <div className="font-medium text-xs sm:text-sm text-[var(--ink)] leading-snug">
                      {i.title}
                    </div>
                    {i.service_name && (
                      <div className="text-[10px] font-mono text-[var(--muted)] mt-1.5">
                        svc: <span className="text-[var(--ink)] font-medium">{i.service_name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Recent Incidents Table */}
              <div className="hidden md:block">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Incident</Th>
                      <Th>Severity</Th>
                      <Th>Status</Th>
                      <Th>Detected At</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.recent_incidents.map((i: any) => (
                      <Tr key={i.id} onClick={() => navigate(`/incidents/${i.id}`)}>
                        <Td>
                          <div className="font-medium text-[var(--ink)] leading-snug">{i.title}</div>
                          {i.service_name && (
                            <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">
                              svc: {i.service_name}
                            </div>
                          )}
                        </Td>
                        <Td>
                          <SeverityBadge severity={i.severity} />
                        </Td>
                        <Td>
                          <StatusBadge status={i.status} />
                        </Td>
                        <Td className="text-xs font-mono text-[var(--muted)]">
                          {formatDate(i.detected_at)}
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
    </div>
  )
}
