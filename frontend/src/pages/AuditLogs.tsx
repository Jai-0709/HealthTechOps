import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { ScrollText, ShieldOff, Search, Lock } from 'lucide-react'

interface AuditEntry {
  id: string
  user_email: string
  user_role: string
  action: string
  resource_type: string
  resource_id?: string
  outcome: 'success' | 'failure' | 'denied'
  details?: string
  timestamp: string
}

export function AuditLogs() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const canView = user?.role === 'ADMIN' || user?.role === 'SRE_ENGINEER'

  const { data: logs = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit'],
    queryFn: () => api.get<AuditEntry[]>('/audit'),
    enabled: canView,
    refetchInterval: 15000,
  })

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-[var(--surface-card)] border border-[var(--hairline)] flex items-center justify-center">
          <ShieldOff className="w-6 h-6 text-[#c64545]" />
        </div>
        <div>
          <h2 className="text-xl font-normal text-[var(--ink)]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            Access Restricted
          </h2>
          <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">
            Immutable audit logs require elevated <strong>ADMIN</strong> or <strong>SRE_ENGINEER</strong> credentials. Your active session is authenticated as <strong>{user?.role}</strong>.
          </p>
        </div>
      </div>
    )
  }

  const filtered = logs.filter((log) => {
    const matchSearch =
      search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.details ?? '').toLowerCase().includes(search.toLowerCase())
    const matchUser =
      userFilter === '' || log.user_email.toLowerCase().includes(userFilter.toLowerCase())
    return matchSearch && matchUser
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Compliance &amp; Governance · Immutable Record
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Audit Logs
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Cryptographically logged trail of all operator actions, automated remediations, and configuration mutations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
          <Lock size={13} className="text-[#5db872]" />
          <span>Append-Only Security Store</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, resource, or details..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface-soft)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-lg transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <input
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          placeholder="Filter by operator email..."
          className="px-3.5 py-2 text-sm bg-[var(--surface-soft)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>System Activity Ledger</CardTitle>
            <CardDescription>All recorded events with operator identity and execution outcome</CardDescription>
          </div>
          <span className="text-xs font-mono text-[var(--muted)]">
            {filtered.length} entries matching
          </span>
        </CardHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">Loading immutable log stream...</div>
        ) : !filtered.length ? (
          <div className="py-12">
            <EmptyState
              icon={<ScrollText size={40} className="text-[var(--primary)] opacity-80" />}
              title="No Audit Entries Found"
              description="Adjust your search filters or generate system actions."
            />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>Operator</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>Outcome</Th>
                <Th>Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((log) => (
                <Tr key={log.id}>
                  <Td className="text-xs font-mono text-[var(--muted)] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </Td>
                  <Td>
                    <div className="text-xs font-medium text-[var(--ink)] leading-snug">
                      {log.user_email}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--muted)] uppercase">
                      {log.user_role}
                    </div>
                  </Td>
                  <Td>
                    <code className="text-xs font-mono text-[var(--primary)] font-medium">
                      {log.action}
                    </code>
                  </Td>
                  <Td className="text-xs font-mono text-[var(--body)]">
                    {log.resource_type}
                    {log.resource_id && (
                      <span className="text-[var(--muted)]"> #{log.resource_id.slice(0, 8)}</span>
                    )}
                  </Td>
                  <Td>
                    <Badge
                      variant={
                        log.outcome === 'success'
                          ? 'success'
                          : log.outcome === 'failure'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {log.outcome.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td className="text-xs text-[var(--muted)] max-w-sm truncate">
                    {log.details || '—'}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
