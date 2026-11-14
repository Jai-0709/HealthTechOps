import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, FileText, GitBranch, Terminal, RefreshCw, Layers } from 'lucide-react'

const TABS = ['Metrics', 'Logs', 'Traces'] as const
type Tab = typeof TABS[number]

const LOG_LEVELS = ['', 'INFO', 'DEBUG', 'WARN', 'ERROR']

export function Observability() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'Metrics'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [logLevel, setLogLevel] = useState('')

  const handleTabChange = (t: Tab) => {
    setTab(t)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', t)
      return next
    })
  }

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['obs-metrics'],
    queryFn: () => api.get<any>('/observability/metrics?hours=1'),
    refetchInterval: 30000,
    enabled: tab === 'Metrics',
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['obs-logs', logLevel],
    queryFn: () => api.get<any>(`/observability/logs${logLevel ? `?level=${logLevel}` : ''}`),
    refetchInterval: 15000,
    enabled: tab === 'Logs',
  })

  const { data: tracesData, isLoading: tracesLoading } = useQuery({
    queryKey: ['obs-traces'],
    queryFn: () => api.get<any>('/observability/traces'),
    refetchInterval: 30000,
    enabled: tab === 'Traces',
  })

  const levelColor = (l: string) =>
    l === 'ERROR'
      ? 'text-[#c64545] font-bold'
      : l === 'WARN'
      ? 'text-[#e8a55a] font-bold'
      : l === 'DEBUG'
      ? 'text-[#a09d96]'
      : 'text-[#5db872]'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Telemetry Pipeline · 6 Microservices
          </div>
          <h1
            className="text-2xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Observability &amp; Telemetry
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Aggregated metrics, structured JSON log streams, and distributed trace spans across synthetic healthcare services.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-xl w-full sm:w-auto overflow-x-auto touch-pan-x">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs rounded-lg transition-all font-medium whitespace-nowrap flex-shrink-0 cursor-pointer ${
                tab === t
                  ? 'bg-[var(--surface-card)] text-[var(--ink)] shadow-xs border border-[var(--hairline)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t === 'Metrics' && <Activity size={14} />}
              {t === 'Logs' && <FileText size={14} />}
              {t === 'Traces' && <GitBranch size={14} />}
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Metrics */}
      {tab === 'Metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Microservice CPU Utilization</CardTitle>
                  <CardDescription>Aggregate CPU load over the last hour (rolling window)</CardDescription>
                </div>
                <span className="text-xs font-mono text-[var(--primary)]">Max: 100%</span>
              </CardHeader>
              {!metricsData?.service_metrics?.length ? (
                <div className="py-16 text-center text-sm text-[var(--muted)]">
                  {metricsLoading ? 'Loading metrics...' : 'Collecting live metrics from synthetic microservices...'}
                </div>
              ) : (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData.service_metrics}>
                      <defs>
                        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#cc785c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#cc785c" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(v) =>
                          new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        }
                        tick={{ fontSize: 11, fill: 'var(--muted)' }}
                        stroke="var(--hairline)"
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} domain={[0, 100]} stroke="var(--hairline)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--canvas)',
                          borderColor: 'var(--hairline)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--ink)',
                          boxShadow: 'none',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        stroke="#cc785c"
                        fill="url(#cpuGrad)"
                        name="CPU %"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Microservice Memory Allocation</CardTitle>
                  <CardDescription>Heap memory pressure and utilization</CardDescription>
                </div>
                <span className="text-xs font-mono text-[#5db872]">Target &lt;80%</span>
              </CardHeader>
              {!metricsData?.service_metrics?.length ? (
                <div className="py-16 text-center text-sm text-[var(--muted)]">
                  {metricsLoading ? 'Loading metrics...' : 'Collecting live metrics...'}
                </div>
              ) : (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricsData.service_metrics}>
                      <defs>
                        <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5db872" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5db872" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline)" vertical={false} />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(v) =>
                          new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        }
                        tick={{ fontSize: 11, fill: 'var(--muted)' }}
                        stroke="var(--hairline)"
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} domain={[0, 100]} stroke="var(--hairline)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--canvas)',
                          borderColor: 'var(--hairline)',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--ink)',
                          boxShadow: 'none',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="memory"
                        stroke="#5db872"
                        fill="url(#memGrad)"
                        name="Memory %"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Logs in Signature Dark Obsidian Terminal */}
      {tab === 'Logs' && (
        <div className="bg-[#181715] text-[#faf9f5] border border-[#2e2b27] rounded-xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2e2b27] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#c64545]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#e8a55a]/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#5db872]/80 inline-block" />
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#a09d96]">
                <Terminal size={14} className="text-[#cc785c]" />
                <span>telemetry-stream :: live-stdout</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#a09d96]">Filter Level:</span>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#252320] text-[#faf9f5] border border-[#2e2b27] rounded-lg font-mono focus:outline-none focus:border-[#cc785c]"
              >
                {LOG_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l || 'ALL LEVELS'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {logsLoading ? (
            <div className="text-center text-[#a09d96] py-16 font-mono text-xs">
              Streaming real-time service logs...
            </div>
          ) : !logsData?.logs?.length ? (
            <div className="text-center text-[#a09d96] py-16 font-mono text-xs">
              Zero logs recorded matching the selected filter.
            </div>
          ) : (
            <div className="font-mono text-xs max-h-[500px] overflow-y-auto space-y-1 p-2 bg-[#1f1e1b] rounded-lg border border-[#2e2b27]">
              {logsData.logs.map((l: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-1.5 px-2 hover:bg-[#252320] rounded transition-colors text-[11px] leading-relaxed"
                >
                  <div className="flex items-center gap-2 flex-shrink-0 text-[10px] sm:text-[11px]">
                    <span className="text-[#a09d96]">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={levelColor(l.level)}>
                      [{l.level}]
                    </span>
                    <span className="text-[#cc785c] font-medium truncate max-w-[120px] sm:max-w-[140px]">
                      {l.service}
                    </span>
                  </div>
                  <span className="text-[#faf9f5] break-words flex-1 pl-0 sm:pl-1">{l.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono text-[#a09d96] pt-2">
            <span>Buffer: 100 entries</span>
            <span>Polling frequency: 15s</span>
          </div>
        </div>
      )}

      {/* Tab 3: Distributed Traces */}
      {tab === 'Traces' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Distributed Trace Spans</CardTitle>
              <CardDescription>Cross-service RPC latency and execution paths</CardDescription>
            </div>
            <span className="text-xs font-mono text-[var(--muted)]">
              {tracesData?.traces?.length ?? 0} spans captured
            </span>
          </CardHeader>

          {tracesLoading ? (
            <div className="py-16 text-center text-sm text-[var(--muted)]">
              Loading distributed trace graphs...
            </div>
          ) : !tracesData?.traces?.length ? (
            <EmptyState
              icon={<GitBranch size={40} className="text-[var(--primary)] opacity-80" />}
              title="No Distributed Traces"
              description="Trace spans will populate automatically as services interact."
            />
          ) : (
            <div className="space-y-3 pt-2">
              {tracesData.traces.map((t: any) => (
                <div
                  key={t.trace_id}
                  className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-soft)] hover:bg-[var(--surface-card)] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <GitBranch size={15} className="text-[var(--primary)]" />
                      <span className="font-mono text-xs font-medium text-[var(--ink)]">
                        {t.trace_id}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border tracking-tight ${
                          t.status === 'ok'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {t.status === 'ok' ? 'Success' : 'Error'}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-[var(--muted)]">
                      Duration: <strong className="text-[var(--ink)]">{t.duration_ms}ms</strong>
                    </div>
                  </div>

                  {/* Span Waterfall Hierarchy */}
                  {t.spans?.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--hairline)]">
                      {t.spans.map((sp: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs font-mono py-1 px-2.5 rounded bg-[var(--canvas)] border border-[var(--hairline)]"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[var(--primary)]">↳</span>
                            <span className="text-[var(--ink)] font-medium">{sp.service}</span>
                            <span className="text-[var(--muted)]">: {sp.operation}</span>
                          </div>
                          <span className="text-[var(--muted)] flex-shrink-0">{sp.duration_ms}ms</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
