import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  LayoutDashboard,
  Server,
  Globe,
  Activity,
  AlertTriangle,
  Bot,
  Wrench,
  Target,
  FlaskConical,
  ScrollText,
  Settings,
  Sun,
  Moon,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  CornerDownLeft,
  Database,
  ShieldAlert,
  Flame,
} from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { cn } from '../../lib/utils'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: 'Pages' | 'Microservices' | 'Runbooks' | 'Incidents' | 'Actions'
  icon: any
  action(): void
  shortcut?: string
  badge?: string
  badgeVariant?: 'danger' | 'warning' | 'success' | 'info' | 'neutral'
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose(): void
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useThemeStore()

  // Active Incidents query
  const { data: incidents } = useQuery({
    queryKey: ['incidents-command-palette'],
    queryFn: () => api.get<any[]>('/incidents?limit=10'),
    staleTime: 15000,
  })

  // Autofocus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build the catalogue of searchable items
  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Pages
      {
        id: 'page-overview',
        title: 'Overview Dashboard',
        subtitle: 'System health, MTTR telemetry & incident feed',
        category: 'Pages',
        icon: LayoutDashboard,
        action: () => {
          navigate('/')
          onClose()
        },
      },
      {
        id: 'page-infrastructure',
        title: 'Infrastructure & Nodes',
        subtitle: 'Kubernetes pods, CPU/RAM quotas & cluster status',
        category: 'Pages',
        icon: Server,
        action: () => {
          navigate('/infrastructure')
          onClose()
        },
      },
      {
        id: 'page-services',
        title: 'Microservices Topology',
        subtitle: '6 synthetic healthcare service endpoints & latency',
        category: 'Pages',
        icon: Globe,
        action: () => {
          navigate('/services')
          onClose()
        },
      },
      {
        id: 'page-observability',
        title: 'Observability & Live Metrics',
        subtitle: 'Real-time telemetry, logs, traces & metrics stream',
        category: 'Pages',
        icon: Activity,
        action: () => {
          navigate('/observability')
          onClose()
        },
      },
      {
        id: 'page-incidents',
        title: 'Incidents & Alerts',
        subtitle: 'Active triage queue, severity filters & incident logs',
        category: 'Pages',
        icon: AlertTriangle,
        action: () => {
          navigate('/incidents')
          onClose()
        },
      },
      {
        id: 'page-ai-investigation',
        title: 'AI Investigation & Diagnostics',
        subtitle: 'Autonomous SRE root-cause analysis & causal hypothesis',
        category: 'Pages',
        icon: Bot,
        action: () => {
          navigate('/ai-investigation')
          onClose()
        },
      },
      {
        id: 'page-automation',
        title: 'Automation & Runbooks',
        subtitle: 'Self-healing runbooks & human approval queue',
        category: 'Pages',
        icon: Wrench,
        action: () => {
          navigate('/automation')
          onClose()
        },
      },
      {
        id: 'page-reliability',
        title: 'Reliability & SLO Tracking',
        subtitle: 'Error budgets, burn rates & 99.9% uptime compliance',
        category: 'Pages',
        icon: Target,
        action: () => {
          navigate('/reliability')
          onClose()
        },
      },
      {
        id: 'page-ai-eval',
        title: 'AI Benchmark & Evaluations',
        subtitle: 'Hallucination scoring, precision/recall SRE evals',
        category: 'Pages',
        icon: FlaskConical,
        action: () => {
          navigate('/ai-evaluation')
          onClose()
        },
      },
      {
        id: 'page-audit-logs',
        title: 'Audit Logs & Governance',
        subtitle: 'HIPAA immutable action log & tamper-proof trail',
        category: 'Pages',
        icon: ScrollText,
        action: () => {
          navigate('/audit-logs')
          onClose()
        },
      },
      {
        id: 'page-settings',
        title: 'System Settings',
        subtitle: 'API keys, synthetic simulator settings & LLM models',
        category: 'Pages',
        icon: Settings,
        action: () => {
          navigate('/settings')
          onClose()
        },
      },

      // Microservices
      {
        id: 'svc-claims',
        title: 'Claims API Service',
        subtitle: 'Port 8010 · Ingestion pipeline for medical claim batches',
        category: 'Microservices',
        icon: Globe,
        action: () => {
          navigate('/services/claims-api')
          onClose()
        },
        badge: ':8010',
      },
      {
        id: 'svc-provider',
        title: 'Provider Portal',
        subtitle: 'Port 8011 · Clinician dashboard & credentialing API',
        category: 'Microservices',
        icon: Globe,
        action: () => {
          navigate('/services/provider-portal')
          onClose()
        },
        badge: ':8011',
      },
      {
        id: 'svc-pharmacy',
        title: 'Pharmacy Service',
        subtitle: 'Port 8012 · Drug dispense verification & prescription sync',
        category: 'Microservices',
        icon: Globe,
        action: () => {
          navigate('/services/pharmacy-service')
          onClose()
        },
        badge: ':8012',
      },
      {
        id: 'svc-identity',
        title: 'Identity & Access Manager',
        subtitle: 'Port 8013 · OAuth2/OIDC token generation & JWT validation',
        category: 'Microservices',
        icon: Globe,
        action: () => {
          navigate('/services/identity-service')
          onClose()
        },
        badge: ':8013',
      },
      {
        id: 'svc-notifications',
        title: 'Notification Gateway',
        subtitle: 'Port 8014 · Urgent clinician SMS & critical patient alerts',
        category: 'Microservices',
        icon: Globe,
        action: () => {
          navigate('/services/notification-service')
          onClose()
        },
        badge: ':8014',
      },
      {
        id: 'svc-database',
        title: 'Synthetic PostgreSQL DB',
        subtitle: 'Port 8015 · Primary patient database & transaction pool',
        category: 'Microservices',
        icon: Database,
        action: () => {
          navigate('/services/synthetic-database')
          onClose()
        },
        badge: ':8015',
      },

      // Runbooks
      {
        id: 'rb-restart',
        title: 'Runbook: Restart Service Pods',
        subtitle: 'Execute rolling restart to clear memory leaks & hung threads',
        category: 'Runbooks',
        icon: RotateCcw,
        action: () => {
          navigate('/automation')
          onClose()
        },
        badge: 'Allowlisted',
        badgeVariant: 'success',
      },
      {
        id: 'rb-clear-cache',
        title: 'Runbook: Flush Redis Cache',
        subtitle: 'Purge stale service keys and warm up clean schema cache',
        category: 'Runbooks',
        icon: Zap,
        action: () => {
          navigate('/automation')
          onClose()
        },
        badge: 'Allowlisted',
        badgeVariant: 'success',
      },
      {
        id: 'rb-scale',
        title: 'Runbook: Scale Horizontal Replicas',
        subtitle: 'Burst replica set +2 instances to absorb traffic spikes',
        category: 'Runbooks',
        icon: Play,
        action: () => {
          navigate('/automation')
          onClose()
        },
        badge: 'Allowlisted',
        badgeVariant: 'success',
      },
      {
        id: 'rb-flush-pool',
        title: 'Runbook: Terminate Zombie DB Connections',
        subtitle: 'Release hung client queries exceeding idle transaction timeout',
        category: 'Runbooks',
        icon: Database,
        action: () => {
          navigate('/automation')
          onClose()
        },
        badge: 'Requires Approval',
        badgeVariant: 'warning',
      },

      // Quick Actions
      {
        id: 'act-theme',
        title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle dashboard appearance theme',
        category: 'Actions',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          toggleTheme()
          onClose()
        },
      },
      {
        id: 'act-critical',
        title: 'Filter Critical Incidents',
        subtitle: 'Open incident queue focused exclusively on severity: CRITICAL',
        category: 'Actions',
        icon: Flame,
        action: () => {
          navigate('/incidents?severity=CRITICAL')
          onClose()
        },
        badge: 'Alerts',
        badgeVariant: 'danger',
      },
      {
        id: 'act-approvals',
        title: 'View Pending SRE Approvals',
        subtitle: 'Open human-in-the-loop remediation queue',
        category: 'Actions',
        icon: ShieldAlert,
        action: () => {
          navigate('/automation')
          onClose()
        },
      },

      {
        id: 'act-live-website',
        title: 'Open Live Cloud Application',
        subtitle: 'https://health-tech-ops.vercel.app',
        category: 'Actions',
        icon: Globe,
        action: () => {
          window.open('https://health-tech-ops.vercel.app', '_blank')
          onClose()
        },
        badge: 'Production',
        badgeVariant: 'success',
      },
    ]

    // Append active incidents dynamically
    if (incidents && Array.isArray(incidents)) {
      incidents.slice(0, 5).forEach((inc) => {
        items.push({
          id: `incident-${inc.id}`,
          title: inc.title,
          subtitle: `${inc.service_name || 'System'} · ${inc.status}`,
          category: 'Incidents',
          icon: AlertTriangle,
          action: () => {
            navigate(`/ai-investigation?incident=${inc.id}`)
            onClose()
          },
          badge: inc.severity,
          badgeVariant:
            inc.severity === 'CRITICAL'
              ? 'danger'
              : inc.severity === 'HIGH'
              ? 'warning'
              : 'info',
        })
      })
    }

    return items
  }, [navigate, onClose, theme, toggleTheme, incidents])

  // Filter items by multi-token fuzzy matching and optional prefix commands
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems
    const raw = query.trim()
    const q = raw.toLowerCase()

    // Prefix detection
    let targetCategory: string | null = null
    let searchTerm = q
    if (q.startsWith('>') || q.startsWith('/')) {
      targetCategory = 'Actions'
      searchTerm = q.slice(1).trim()
    } else if (q.startsWith('#') || q.startsWith('@')) {
      targetCategory = 'Microservices'
      searchTerm = q.slice(1).trim()
    } else if (q.startsWith('!') || q.startsWith('?')) {
      targetCategory = 'Incidents'
      searchTerm = q.slice(1).trim()
    } else if (q.startsWith('$')) {
      targetCategory = 'Runbooks'
      searchTerm = q.slice(1).trim()
    }

    const tokens = searchTerm.split(/\s+/).filter(Boolean)

    return allItems.filter((item) => {
      if (targetCategory && item.category !== targetCategory) {
        return false
      }
      if (tokens.length === 0) return true
      const fullCorpus = `${item.title} ${item.subtitle || ''} ${item.category} ${item.badge || ''} ${item.id}`.toLowerCase()
      return tokens.every((token) => fullCorpus.includes(token))
    })
  }, [allItems, query])

  // Reset selectedIndex when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered.length, query])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector('[data-selected="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) {
        item.action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-[var(--canvas)] border-0 sm:border border-[var(--hairline)] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[80vh] text-[var(--ink)] safe-area-pt safe-area-pb"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--hairline)] bg-[var(--surface-soft)]/50">
          <Search size={18} className="text-[var(--muted)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, service name, incident or runbook..."
            className="flex-1 bg-transparent text-base sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted-soft)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="sm:hidden px-2 py-1 text-xs font-medium text-[var(--primary)] active:opacity-75"
          >
            Cancel
          </button>
        </div>

        {/* Quick Category Quick-Filters (One-tap filtering for Mobile & Desktop) */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--hairline)] bg-[var(--surface-soft)]/40 overflow-x-auto text-[11px]">
          <span className="text-[var(--muted)] font-mono text-[10px] uppercase tracking-wider mr-1 select-none">
            Filter:
          </span>
          {[
            { label: 'All', prefix: '' },
            { label: 'Services (#)', prefix: '#' },
            { label: 'Incidents (!)', prefix: '!' },
            { label: 'Runbooks ($)', prefix: '$' },
            { label: 'Actions (>)', prefix: '>' },
          ].map((f) => {
            const isActive = f.prefix
              ? query.startsWith(f.prefix)
              : !['#', '!', '$', '>'].some((p) => query.startsWith(p))
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => {
                  setQuery(f.prefix)
                  inputRef.current?.focus()
                }}
                className={cn(
                  'px-2 py-0.5 rounded-md font-medium transition-colors select-none cursor-pointer text-[11px]',
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--surface-card)] text-[var(--muted)] border border-[var(--hairline)] hover:text-[var(--ink)]'
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-[var(--hairline-soft)] max-h-[60vh] sm:max-h-[500px]"
        >
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[var(--muted)]">No results found for "{query}"</p>
              <p className="text-xs text-[var(--muted-soft)] mt-1">
                Try searching for a service (:8010), incident, or action like "theme"
              </p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  data-selected={isSelected}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors select-none',
                    isSelected
                      ? 'bg-[var(--surface-card)] text-[var(--ink)] shadow-xs'
                      : 'text-[var(--body)] hover:bg-[var(--surface-soft)]'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border',
                        isSelected
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                          : 'bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--hairline)]'
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {item.title}
                        </span>
                        <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--hairline)]">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border select-none',
                          item.badgeVariant === 'danger'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                            : item.badgeVariant === 'success'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--hairline)]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && (
                      <CornerDownLeft size={13} className="text-[var(--primary)] hidden sm:block" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-[var(--surface-soft)]/50 border-t border-[var(--hairline)] text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--hairline)] font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--hairline)] font-mono text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--hairline)] font-mono text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--hairline)] font-mono text-[10px]">
                ESC
              </kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="font-mono text-[10px] text-[var(--muted-soft)]">HealthTechOps Command OmniSearch</span>
        </div>
      </div>
    </div>
  )
}

