import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { StatusBadge } from '../components/ui/Badge'
import { Circle, ArrowRight, Activity, Server, Zap } from 'lucide-react'
import type { Service } from '../types'

function ServiceCard({ s }: { s: Service }) {
  const navigate = useNavigate()
  const dot =
    s.status === 'HEALTHY'
      ? 'bg-[#5db872]'
      : s.status === 'DEGRADED'
      ? 'bg-[#e8a55a]'
      : s.status === 'DOWN'
      ? 'bg-[#c64545]'
      : 'bg-[var(--muted-soft)]'

  return (
    <div
      onClick={() => navigate(`/services/${s.slug}`)}
      className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl p-4 sm:p-6 cursor-pointer hover:border-[var(--primary)] transition-all duration-150 group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
            <h3 className="text-base font-medium text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
              {s.name}
            </h3>
          </div>
          <StatusBadge status={s.status} />
        </div>

        <p className="text-xs text-[var(--muted)] mb-5 line-clamp-2 leading-relaxed">
          {s.description}
        </p>

        <div className="grid grid-cols-3 gap-3 p-3 bg-[var(--surface-soft)] rounded-lg border border-[var(--hairline)]">
          {[
            ['CPU', `${s.cpu_percent?.toFixed(1) ?? '0.0'}%`],
            ['Memory', `${s.memory_percent?.toFixed(1) ?? '0.0'}%`],
            ['Latency', `${s.avg_latency_ms?.toFixed(0) ?? '0'}ms`],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                {k}
              </div>
              <div className="text-xs font-mono font-semibold text-[var(--ink)] mt-0.5">
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--hairline)] flex items-center justify-between text-xs font-mono text-[var(--muted)]">
        <span>Uptime: <strong className="text-[var(--ink)]">{s.uptime_percent?.toFixed(2) ?? '100.00'}%</strong></span>
        {s.port && <span className="bg-[var(--canvas)] px-2 py-0.5 rounded border border-[var(--hairline)]">:{s.port}</span>}
      </div>
    </div>
  )
}

export function Services() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get<Service[]>('/services'),
    refetchInterval: 15000,
  })

  const counts = services
    ? {
        healthy: services.filter((s) => s.status === 'HEALTHY').length,
        degraded: services.filter((s) => s.status === 'DEGRADED').length,
        down: services.filter((s) => s.status === 'DOWN').length,
      }
    : null

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Microservice Topology · Ports 8010–8015
          </div>
          <h1
            className="text-2xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Services Catalog
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Synthetic healthcare microservices simulating real-world workloads, chaos injection endpoints, and telemetry probes.
          </p>
        </div>

        {counts && (
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-[#5db872]">
              <span className="w-2 h-2 rounded-full bg-[#5db872]" />
              {counts.healthy} healthy
            </span>
            <span className="flex items-center gap-1.5 text-[#e8a55a]">
              <span className="w-2 h-2 rounded-full bg-[#e8a55a]" />
              {counts.degraded} degraded
            </span>
            <span className="flex items-center gap-1.5 text-[#c64545]">
              <span className="w-2 h-2 rounded-full bg-[#c64545]" />
              {counts.down} down
            </span>
          </div>
        )}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse h-48 bg-[var(--surface-soft)] rounded-xl border border-[var(--hairline)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(services) ? services : [])
            .filter((s) => s && s.id)
            .map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
        </div>
      )}
    </div>
  )
}
