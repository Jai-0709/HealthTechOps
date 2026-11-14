import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Button } from '../components/ui/Button'
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

const DEMOS = [
  { email: 'admin@healthtechops.local', role: 'ADMIN', label: 'Admin User', desc: 'Full authority & remediation approvals' },
  { email: 'sre@healthtechops.local', role: 'SRE_ENGINEER', label: 'SRE Engineer', desc: 'Incident triage & diagnostic execution' },
  { email: 'viewer@healthtechops.local', role: 'VIEWER', label: 'Operations Viewer', desc: 'Read-only telemetry & reliability auditing' },
]

export function Login() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const auto = searchParams.get('autologin')
    if (auto === 'admin') {
      login('admin@healthtechops.local', 'HealthTechOps2024!')
        .then(() => navigate('/'))
        .catch(() => {})
    }
  }, [searchParams, login, navigate])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  function applyDemo(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('HealthTechOps2024!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <BrandLogo size="lg" />
          </div>
          <h1
            className="text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            HealthTechOps
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 font-normal">
            Intelligent Infrastructure. Reliable Healthcare Technology.
          </p>
        </div>

        {/* Synthetic Disclaimer Banner */}
        <div className="mb-6 px-4 py-2.5 bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0 animate-pulse" />
          <span className="leading-relaxed">
            <strong>SYNTHETIC ENVIRONMENT</strong> — All data, metrics, and services are simulated. Not an official Optum product.
          </span>
        </div>

        {/* Sign In Card */}
        <div className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-xl p-8 mb-6">
          {error && (
            <div className="flex items-center gap-2.5 mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-[#c64545] dark:text-[#ef5350]">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@healthtechops.local"
                className="w-full px-3.5 py-2 text-sm bg-[var(--canvas)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-lg transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 text-sm bg-[var(--canvas)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-lg transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Sign In to Platform
            </Button>
          </form>
        </div>

        {/* Quick-fill Demo Accounts */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] px-1">
            <span className="font-medium uppercase tracking-wider text-[10px]">
              Available Demo Credentials
            </span>
            <span className="font-mono text-[11px] bg-[var(--surface-card)] px-1.5 py-0.5 rounded border border-[var(--hairline)]">
              HealthTechOps2024!
            </span>
          </div>

          <div className="space-y-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => applyDemo(d.email)}
                className="w-full text-left p-3 rounded-lg border border-[var(--hairline)] bg-[var(--surface-card)] hover:bg-[var(--surface-cream-strong)] hover:border-[var(--primary)]/40 transition-all duration-150 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--primary)]" />
                    <span className="text-xs font-medium text-[var(--ink)]">{d.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--canvas)] border border-[var(--hairline)] text-[var(--muted)]">
                      {d.role}
                    </span>
                  </div>
                  <ArrowRight
                    size={12}
                    className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1 pl-5">
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
