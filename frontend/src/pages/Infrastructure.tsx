import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { MetricCard } from '../components/ui/MetricCard'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { Cpu, HardDrive, MemoryStick, Network, Server, Terminal, ShieldCheck } from 'lucide-react'

export function Infrastructure() {
  const { data, isLoading } = useQuery({
    queryKey: ['infra'],
    queryFn: () => api.get<any>('/infrastructure/metrics'),
    refetchInterval: 10000,
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Host Telemetry · Compute &amp; Capacity
          </div>
          <h1
            className="text-2xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Infrastructure Health
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Host system resources, CPU core distribution, memory saturation, and network throughput telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
          <Server size={14} className="text-[#5db872]" />
          <span>Local Node Online</span>
        </div>
      </div>

      {/* Primary Infrastructure Metric Cards (2x2 on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricCard
          loading={isLoading}
          title="CPU Utilization"
          value={data?.cpu?.percent?.toFixed(1) ?? '—'}
          unit="%"
          icon={<Cpu size={18} />}
          status={
            data?.cpu?.percent > 85 ? 'critical' : data?.cpu?.percent > 65 ? 'warning' : 'healthy'
          }
          trendValue={`${data?.cpu?.count ?? '?'} logical cores`}
        />
        <MetricCard
          loading={isLoading}
          title="Memory Saturated"
          value={data?.memory?.percent?.toFixed(1) ?? '—'}
          unit="%"
          icon={<MemoryStick size={18} />}
          status={
            data?.memory?.percent > 85 ? 'critical' : data?.memory?.percent > 70 ? 'warning' : 'healthy'
          }
          trendValue={`${data?.memory?.used_gb ?? '0'} GB / ${data?.memory?.total_gb ?? '0'} GB`}
        />
        <MetricCard
          loading={isLoading}
          title="Disk Capacity"
          value={data?.disk?.percent?.toFixed(1) ?? '—'}
          unit="%"
          icon={<HardDrive size={18} />}
          status={
            data?.disk?.percent > 85 ? 'critical' : data?.disk?.percent > 70 ? 'warning' : 'healthy'
          }
          trendValue={`${data?.disk?.free_gb ?? '0'} GB free`}
        />
        <MetricCard
          loading={isLoading}
          title="Network Ingress"
          value={data?.network?.bytes_recv_mb?.toFixed(1) ?? '—'}
          unit="MB"
          icon={<Network size={18} />}
          status="neutral"
          trendValue={`Sent: ${data?.network?.bytes_sent_mb?.toFixed(1) ?? '0'} MB`}
        />
      </div>

      {/* Resource Gauges & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Gauges */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Hardware Utilization Thresholds</CardTitle>
              <CardDescription>Live compute load relative to operating thresholds</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-6 pt-2">
            {[
              {
                label: 'CPU Core Allocation',
                value: data?.cpu?.percent ?? 0,
                detail: `${data?.cpu?.count ?? '?'} active cores`,
                color: 'bg-[#cc785c]',
                text: 'text-[#cc785c]',
              },
              {
                label: 'Physical Memory (RAM)',
                value: data?.memory?.percent ?? 0,
                detail: `${data?.memory?.used_gb ?? 0} GB used of ${data?.memory?.total_gb ?? 0} GB`,
                color: 'bg-[#5db872]',
                text: 'text-[#5db872]',
              },
              {
                label: 'Persistent Storage (Disk)',
                value: data?.disk?.percent ?? 0,
                detail: `${data?.disk?.free_gb ?? 0} GB available`,
                color: 'bg-[#e8a55a]',
                text: 'text-[#b25e00] dark:text-[#ffb74d]',
              },
            ].map((m) => (
              <div key={m.label} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <span className="font-medium text-[var(--ink)]">{m.label}</span>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-mono text-[var(--muted)] text-[11px] sm:text-xs">{m.detail}</span>
                    <span className={`font-mono font-bold ${m.text}`}>{m.value.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--hairline)]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${m.color}`}
                    style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* System Specs in Dark Technical Surface */}
        <div className="bg-[#181715] text-[#faf9f5] border border-[#2e2b27] rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 border-b border-[#2e2b27] pb-3 text-xs font-mono text-[#a09d96]">
            <Terminal size={14} className="text-[#cc785c]" />
            <span>node-specifications :: host-env</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              ['CPU Core Count', `${data?.cpu?.count ?? '—'} Cores`],
              ['Total System RAM', `${data?.memory?.total_gb ?? '—'} GB`],
              ['Available RAM', `${data?.memory?.available_gb ?? '—'} GB`],
              ['Storage Volume', `${data?.disk?.total_gb ?? '—'} GB`],
              ['Network Rx', `${data?.network?.bytes_recv_mb ?? '—'} MB`],
              ['Network Tx', `${data?.network?.bytes_sent_mb ?? '—'} MB`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 border-b border-[#2e2b27]/60">
                <span className="text-[#a09d96]">{k}</span>
                <span className="text-[#faf9f5] font-semibold">{v}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[10px] font-mono text-[#a09d96] flex items-center justify-between">
            <span>Synthetic Probe Mode</span>
            <span className="text-[#5db872]">✓ PASS</span>
          </div>
        </div>
      </div>

      {/* Host Process Execution Table */}
      {data?.processes?.length > 0 && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Top Host System Processes</CardTitle>
              <CardDescription>Live active processes ordered by compute utilization</CardDescription>
            </div>
            <span className="text-xs font-mono text-[var(--muted)]">
              {data.processes.length} top processes
            </span>
          </CardHeader>

          <Table>
            <Thead>
              <Tr>
                <Th>PID</Th>
                <Th>Process Image</Th>
                <Th>CPU Load</Th>
                <Th>Memory Resident</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.processes.map((p: any) => (
                <Tr key={p.pid}>
                  <Td className="font-mono text-xs text-[var(--muted)]">{p.pid}</Td>
                  <Td>
                    <span className="font-mono text-xs font-medium text-[var(--ink)]">
                      {p.name}
                    </span>
                  </Td>
                  <Td className="font-mono text-xs font-semibold text-[var(--ink)]">
                    {p.cpu_percent.toFixed(1)}%
                  </Td>
                  <Td className="font-mono text-xs text-[var(--muted)]">
                    {p.memory_percent.toFixed(1)}%
                  </Td>
                  <Td>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-soft)] text-[var(--body)] border border-[var(--hairline)]">
                      {p.status}
                    </span>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      )}
    </div>
  )
}
