import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { MetricCard } from '../components/ui/MetricCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Zap, FileText, Terminal, Activity, Cpu, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/authStore'
import { formatDate } from '../lib/utils'

const FAILURES = ['cpu_spike', 'memory_exhaustion', 'high_latency', 'error_spike', 'service_down']

export function ServiceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [injectOpen, setInjectOpen] = useState(false)
  const [failType, setFailType] = useState('cpu_spike')
  const [duration, setDuration] = useState(60)

  const { data, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => api.get<any>(`/services/${slug}`),
    refetchInterval: 10000,
  })

  const { data: logs } = useQuery({
    queryKey: ['service-logs', slug],
    queryFn: () => api.get<any>(`/services/${slug}/logs`),
    refetchInterval: 15000,
  })

  const inject = useMutation({
    mutationFn: (body: any) => api.post(`/services/${slug}/inject-failure`, body),
    onSuccess: () => {
      toast.success('Synthetic failure injected into microservice')
      setInjectOpen(false)
      qc.invalidateQueries({ queryKey: ['service', slug] })
    },
    onError: (e: any) => toast.error(e.message || 'Failure injection failed'),
  })

  if (isLoading) {
    return <div className="py-24 text-center text-sm text-[var(--muted)]">Loading service dossier...</div>
  }

  if (!data) {
    return (
      <div className="py-24 text-center space-y-3">
        <h2 className="text-xl font-medium text-[var(--ink)]">Service Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/services')}>
          Return to Catalog
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/services')}
            className="p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors mt-1"
            title="Back to services catalog"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <StatusBadge status={data.status} />
              {data.port && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--hairline)] text-[var(--muted)]">
                  Port :{data.port}
                </span>
              )}
              <span className="text-xs font-mono text-[var(--muted)]">slug: {data.slug}</span>
            </div>

            <h1
              className="text-3xl font-normal text-[var(--ink)] tracking-tight"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {data.name}
            </h1>

            <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">{data.description}</p>
          </div>
        </div>

        {user?.role !== 'VIEWER' && (
          <Button variant="primary" size="md" onClick={() => setInjectOpen(true)}>
            <Zap size={15} />
            <span>Inject Chaos Anomaly</span>
          </Button>
        )}
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Utilization"
          value={data.cpu_percent.toFixed(1)}
          unit="%"
          icon={<Cpu size={18} />}
          status={data.cpu_percent > 80 ? 'critical' : data.cpu_percent > 60 ? 'warning' : 'healthy'}
        />
        <MetricCard
          title="Memory Pressure"
          value={data.memory_percent.toFixed(1)}
          unit="%"
          icon={<Activity size={18} />}
          status={data.memory_percent > 85 ? 'critical' : data.memory_percent > 70 ? 'warning' : 'healthy'}
        />
        <MetricCard
          title="P95 Latency"
          value={data.avg_latency_ms.toFixed(0)}
          unit="ms"
          icon={<Clock size={18} />}
          status={data.avg_latency_ms > 1000 ? 'warning' : 'healthy'}
        />
        <MetricCard
          title="Service Availability"
          value={data.uptime_percent.toFixed(2)}
          unit="%"
          icon={<CheckCircle size={18} />}
          status={data.uptime_percent >= 99.9 ? 'healthy' : 'warning'}
        />
      </div>

      {/* Historical Telemetry Graph */}
      {data.metrics_history?.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Telemetry Profile (Last 2 Hours)</CardTitle>
              <CardDescription>CPU and memory utilization recorded by Prometheus agent</CardDescription>
            </div>
            <span className="text-xs font-mono text-[var(--muted)]">15s sampling</span>
          </CardHeader>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.metrics_history}>
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
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#cc785c"
                  name="CPU %"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#5db872"
                  name="Memory %"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Live Log Stream in Signature Dark Obsidian Card */}
      <div className="bg-[#181715] text-[#faf9f5] border border-[#2e2b27] rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-[#2e2b27] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#c64545]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#e8a55a]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#5db872]/80 inline-block" />
            </div>
            <div className="ml-3 flex items-center gap-2 text-xs font-mono text-[#a09d96]">
              <Terminal size={14} className="text-[#cc785c]" />
              <span>service-stdout :: {slug}</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#a09d96]">Recent 25 entries</span>
        </div>

        {!logs?.logs?.length ? (
          <div className="py-12 text-center text-xs font-mono text-[#a09d96]">
            No logs captured yet from {slug}.
          </div>
        ) : (
          <div className="font-mono text-xs max-h-72 overflow-y-auto space-y-1 p-2 bg-[#1f1e1b] rounded-lg border border-[#2e2b27]">
            {logs.logs.slice(0, 25).map((l: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 py-1 px-2 hover:bg-[#252320] rounded transition-colors text-[11px]"
              >
                <span className="text-[#a09d96] flex-shrink-0 w-20">
                  {new Date(l.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`flex-shrink-0 w-12 font-bold ${
                    l.level === 'ERROR'
                      ? 'text-[#c64545]'
                      : l.level === 'WARN'
                      ? 'text-[#e8a55a]'
                      : 'text-[#5db872]'
                  }`}
                >
                  [{l.level}]
                </span>
                <span className="text-[#faf9f5] break-all">{l.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failure Injection Modal */}
      <Modal open={injectOpen} onClose={() => setInjectOpen(false)} title="Inject Chaos Anomaly">
        <div className="space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            <strong>Synthetic Chaos:</strong> This simulates a fault on microservice <code>{slug}</code>. The automated detector and AI investigation will observe the resulting metrics.
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">Anomaly Type</label>
            <select
              value={failType}
              onChange={(e) => setFailType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[var(--canvas)] text-[var(--ink)] border border-[var(--hairline)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            >
              {FAILURES.map((f) => (
                <option key={f} value={f}>
                  {f.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
              Duration (seconds)
            </label>
            <input
              type="number"
              min={10}
              max={300}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-[var(--canvas)] text-[var(--ink)] border border-[var(--hairline)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex gap-2.5 justify-end pt-3">
            <Button variant="ghost" onClick={() => setInjectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={inject.isPending}
              onClick={() =>
                inject.mutate({ failure_type: failType, duration_seconds: duration })
              }
            >
              Execute Chaos Injection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
