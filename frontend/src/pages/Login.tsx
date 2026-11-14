import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { BrandLogo } from '../components/ui/BrandLogo'
import { Button } from '../components/ui/Button'
import { AlertCircle, ArrowRight, ShieldCheck, Lock, Mail, Sparkles } from 'lucide-react'

const DEMOS = [
  {
    email: 'admin@healthtechops.local',
    role: 'ADMIN',
    label: 'Admin User',
    desc: 'Full authority & autonomous remediation approvals',
    badgeColor: 'border-[#cc785c]/40 text-[#cc785c]',
  },
  {
    email: 'sre@healthtechops.local',
    role: 'SRE_ENGINEER',
    label: 'SRE Engineer',
    desc: 'Incident triage, metric telemetry & diagnostic execution',
    badgeColor: 'border-[#5db872]/40 text-[#2e7d32] dark:text-[#81c784]',
  },
  {
    email: 'viewer@healthtechops.local',
    role: 'VIEWER',
    label: 'Operations Viewer',
    desc: 'Read-only observability, service health & reliability auditing',
    badgeColor: 'border-[var(--hairline)] text-[var(--muted)]',
  },
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
            <BrandLogo size="xl" />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[var(--ink)] tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            HealthTechOps
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-normal max-w-xs mx-auto">
            Autonomous Cloud Reliability &amp; Incident Operations Platform
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-[var(--surface-soft)] border border-[var(--hairline)] rounded-2xl p-5 sm:p-8 mb-6 shadow-sm">
          {error && (
            <div className="flex items-center gap-2.5 mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-[#c64545] dark:text-[#ef5350]">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@healthtechops.local"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm bg-[var(--canvas)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-xl transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--ink)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm bg-[var(--canvas)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-xl transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 h-11 text-sm font-medium rounded-xl"
              size="lg"
            >
              Sign In to Platform
            </Button>
          </form>
        </div>

        {/* Quick-fill Demo Accounts */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] px-1">
            <span className="font-medium uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[var(--primary)]" />
              <span>One-Click Demo Access</span>
            </span>
            <span className="font-mono text-[11px] bg-[var(--surface-card)] px-2 py-0.5 rounded-md border border-[var(--hairline)]">
              HealthTechOps2024!
            </span>
          </div>

          <div className="space-y-2">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => applyDemo(d.email)}
                className="w-full text-left p-3 sm:p-3.5 rounded-xl border border-[var(--hairline)] bg-[var(--surface-card)] hover:bg-[var(--surface-cream-strong)] hover:border-[var(--primary)]/40 transition-all duration-150 group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[var(--primary)] flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-[var(--ink)]">
                      {d.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--canvas)] border ${d.badgeColor}`}
                    >
                      {d.role}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <div className="text-[11px] text-[var(--muted)] mt-1 pl-6 leading-relaxed">
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
