import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { SeverityBadge, StatusBadge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { formatDate, formatDuration } from '../lib/utils'
import { AlertTriangle, Filter, Search } from 'lucide-react'
import type { Incident } from '../types'

const SEVERITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']
const STATUSES = ['', 'OPEN', 'INVESTIGATING', 'ACKNOWLEDGED', 'REMEDIATION_PENDING', 'RESOLVED', 'CLOSED']

export function Incidents() {
  const navigate = useNavigate()
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', severity, status],
    queryFn: () => {
      const p = new URLSearchParams()
      if (severity) p.set('severity', severity)
      if (status) p.set('status', status)
      return api.get<Incident[]>(`/incidents?${p}`)
    },
    refetchInterval: 15000,
  })

  const filtered = data?.filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            SRE Incident Management · Automated Detection
          </div>
          <h1
            className="text-2xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Incident Log
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Real-time anomaly detection stream, timeline events, and automated escalation logs.
          </p>
        </div>

        <div className="text-xs font-mono text-[var(--muted)]">
          Showing <strong className="text-[var(--ink)]">{filtered.length}</strong> incidents
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incident titles or services..."
            className="w-full pl-9 pr-4 py-2.5 sm:py-2 text-base sm:text-sm bg-[var(--surface-soft)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-xl sm:rounded-lg transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[var(--surface-soft)] text-[var(--ink)] border border-[var(--hairline)] rounded-xl sm:rounded-lg focus:outline-none focus:border-[var(--primary)]"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s ? `Severity: ${s}` : 'All Severities'}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[var(--surface-soft)] text-[var(--ink)] border border-[var(--hairline)] rounded-xl sm:rounded-lg focus:outline-none focus:border-[var(--primary)]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s ? `Status: ${s.replace(/_/g, ' ')}` : 'All Statuses'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents Container */}
      <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-2xl p-3 sm:p-0 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">Loading incident repository...</div>
        ) : !filtered.length ? (
          <div className="p-12">
            <EmptyState
              icon={<AlertTriangle size={40} className="text-[var(--primary)] opacity-80" />}
              title="No Incidents Found"
              description="No active or past incidents match your selected filters."
            />
          </div>
        ) : (
          <>
            {/* Mobile Incident Cards (Senior Mobile UX) */}
            <div className="md:hidden space-y-2.5">
              {filtered.map((i) => (
                <div
                  key={i.id}
                  onClick={() => navigate(`/incidents/${i.id}`)}
                  className="p-4 rounded-xl border border-[var(--hairline)] bg-[var(--surface-soft)] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <SeverityBadge severity={i.severity} />
                      <StatusBadge status={i.status} />
                    </div>
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      {formatDate(i.detected_at)}
                    </span>
                  </div>

                  <div className="font-medium text-sm text-[var(--ink)] leading-snug">
                    {i.title}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--hairline)]/60 text-xs">
                    <span className="text-[11px] font-mono text-[var(--muted)]">
                      svc: <span className="text-[var(--ink)] font-semibold">{i.service_name || 'core-platform'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-[var(--primary)] flex items-center gap-1 font-medium">
                      Investigate →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Incident &amp; Scope</Th>
                    <Th>Severity</Th>
                    <Th>Status</Th>
                    <Th>Detected At</Th>
                    <Th>Duration</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((i) => (
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
                      <Td className="text-xs font-mono text-[var(--muted)]">
                        {formatDuration(i.detected_at, i.resolved_at)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
