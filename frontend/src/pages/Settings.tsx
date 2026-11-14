import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { User, Bot, Activity, Info, Moon, Sun, ShieldCheck, Terminal, Server, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface AIStatus {
  available: boolean
  models: string[]
  base_url: string
  configured_model: string
  error?: string
}

interface HealthResponse {
  status: string
  service: string
  version: string
  synthetic: boolean
}

const TABS = [
  { id: 'profile', label: 'Operator Profile', icon: User },
  { id: 'ai', label: 'Ollama AI Engine', icon: Bot },
  { id: 'monitoring', label: 'Monitoring Agent', icon: Activity },
  { id: 'system', label: 'System Topology', icon: Info },
] as const

type Tab = (typeof TABS)[number]['id']

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-[var(--hairline)] last:border-0">
      <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
      <span className="text-xs font-mono text-[var(--ink)] font-medium text-right max-w-[65%]">
        {value}
      </span>
    </div>
  )
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const { user } = useAuthStore()
  const { theme, toggle } = useThemeStore()

  const { data: aiStatus, isLoading: aiLoading, refetch: refetchAI } = useQuery<AIStatus>({
    queryKey: ['ai-status'],
    queryFn: () => api.get<AIStatus>('/ai/status'),
    enabled: activeTab === 'ai',
    refetchOnWindowFocus: false,
  })

  const { data: health, isLoading: healthLoading } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: () => fetch('/health').then((r) => r.json()),
    enabled: activeTab === 'system',
    refetchOnWindowFocus: false,
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--hairline)] pb-6">
        <div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-[var(--primary)] mb-1">
            Configuration &amp; Provider Registry
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Settings &amp; Environment
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Operator profile, local Ollama engine diagnostics, Prometheus scraper status, and environment flags.
          </p>
        </div>

        {/* Theme Quick Toggle */}
        <button
          onClick={toggle}
          className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] hover:bg-[var(--surface-card)] transition-colors inline-flex items-center gap-2"
        >
          {theme === 'dark' ? <Sun size={14} className="text-[#e8a55a]" /> : <Moon size={14} className="text-[#cc785c]" />}
          <span>Theme: {theme === 'dark' ? 'Dark Obsidian' : 'Warm Cream'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sub-Nav Tabs (Horizontal on mobile, Vertical on desktop) */}
        <div className="md:col-span-3 flex md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 touch-pan-x">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl md:rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 md:w-full text-left cursor-pointer active:scale-95 ${
                activeTab === id
                  ? 'bg-[var(--surface-card)] text-[var(--ink)] border-l-0 md:border-l-2 border-b-2 md:border-b-0 border-[var(--primary)] shadow-xs'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]'
              }`}
            >
              <Icon size={15} className={activeTab === id ? 'text-[var(--primary)]' : 'text-[var(--muted)]'} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Panels (9 cols) */}
        <div className="md:col-span-9 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Authenticated Operator</CardTitle>
                  <CardDescription>Current JWT security context and RBAC permissions</CardDescription>
                </div>
                <Badge variant={user?.role === 'ADMIN' ? 'danger' : user?.role === 'SRE_ENGINEER' ? 'warning' : 'info'}>
                  {user?.role}
                </Badge>
              </CardHeader>

              <div className="divide-y divide-[var(--hairline)] pt-2">
                <InfoRow label="Operator Full Name" value={user?.full_name || '—'} />
                <InfoRow label="Email Address" value={user?.email || '—'} />
                <InfoRow label="Role Type" value={user?.role || '—'} />
                <InfoRow
                  label="Remediation Approval Authority"
                  value={
                    user?.role === 'ADMIN'
                      ? 'Authorized (Full Access)'
                      : user?.role === 'SRE_ENGINEER'
                      ? 'Authorized (SRE Level)'
                      : 'Unauthorized (Read-Only)'
                  }
                />
                <InfoRow label="Session Security" value="HS256 Bearer Token (24h TTL)" />
              </div>
            </Card>
          )}

          {/* AI Engine Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Local Ollama LLM Provider</CardTitle>
                    <CardDescription>FOSS zero-cost local LLM inference server</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetchAI()}>
                    Probe Server
                  </Button>
                </CardHeader>

                <div className="divide-y divide-[var(--hairline)] pt-2">
                  <InfoRow
                    label="Connection Status"
                    value={
                      aiStatus?.available ? (
                        <span className="text-[#5db872] flex items-center gap-1.5 justify-end">
                          <CheckCircle2 size={13} />
                          <span>Connected (localhost:11434)</span>
                        </span>
                      ) : (
                        <span className="text-[#c64545]">Offline (Not reachable)</span>
                      )
                    }
                  />
                  <InfoRow label="Base URL" value={aiStatus?.base_url || 'http://localhost:11434'} />
                  <InfoRow label="Configured Model" value={aiStatus?.configured_model || 'llama3.2'} />
                  <InfoRow
                    label="Discovered Models"
                    value={
                      aiStatus?.models?.length ? (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {aiStatus.models.map((m) => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] border border-[var(--hairline)]">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'None detected'
                      )
                    }
                  />
                </div>
              </Card>

              {/* FOSS Compliance Guarantee Card */}
              <div className="p-4 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl text-xs space-y-1.5">
                <div className="font-medium text-[var(--ink)] uppercase tracking-wider text-[10px]">
                  100% Free &amp; Open Source Guarantee
                </div>
                <p className="text-[var(--muted)] leading-relaxed">
                  HealthTechOps relies exclusively on free, open-source software. Zero paid APIs, zero proprietary cloud models, zero subscriptions. All AI inference is executed locally via Ollama.
                </p>
              </div>
            </div>
          )}

          {/* Monitoring Agent Tab */}
          {activeTab === 'monitoring' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Prometheus Exporter &amp; Telemetry Scraper</CardTitle>
                  <CardDescription>Host metrics collector and synthetic microservice prober</CardDescription>
                </div>
              </CardHeader>

              <div className="divide-y divide-[var(--hairline)] pt-2">
                <InfoRow label="Exporter Endpoint" value="http://localhost:9100/metrics" />
                <InfoRow label="Scrape Interval" value="15 seconds" />
                <InfoRow label="Monitored Microservices" value="6 synthetic ports (8010–8015)" />
                <InfoRow label="Host Metrics Collector" value="psutil (CPU, Memory, Disk, Net)" />
                <InfoRow label="Telemetry Format" value="Prometheus OpenMetrics / Text 0.0.4" />
              </div>
            </Card>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>System &amp; Environment Metadata</CardTitle>
                  <CardDescription>Application version and synthetic environment flags</CardDescription>
                </div>
              </CardHeader>

              <div className="divide-y divide-[var(--hairline)] pt-2">
                <InfoRow label="Application Title" value="HealthTechOps (AIOps Platform)" />
                <InfoRow label="Version" value="1.0.0-rc1" />
                <InfoRow
                  label="Synthetic Environment Flag"
                  value={<Badge variant="warning">SYNTHETIC SIMULATION</Badge>}
                />
                <InfoRow label="Backend API" value="FastAPI + SQLAlchemy + SQLite" />
                <InfoRow label="Frontend Engine" value="React 18 + Vite + Tailwind CSS + TanStack Query" />
                <InfoRow label="Design Authority" value="DESIGN.md (Warm Cream Editorial System)" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
