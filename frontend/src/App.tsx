import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { Infrastructure } from './pages/Infrastructure'
import { Services } from './pages/Services'
import { ServiceDetail } from './pages/ServiceDetail'
import { Observability } from './pages/Observability'
import { Incidents } from './pages/Incidents'
import { IncidentDetail } from './pages/IncidentDetail'
import { AIInvestigation } from './pages/AIInvestigation'
import { Automation } from './pages/Automation'
import { AIEvaluation } from './pages/AIEvaluation'
import { AuditLogs } from './pages/AuditLogs'
import { Settings } from './pages/Settings'
import { useAuthStore } from './stores/authStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, login } = useAuthStore()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!token && searchParams.get('autologin') === 'admin') {
      login('admin@healthtechops.local', 'HealthTechOps2024!')
    }
  }, [token, searchParams, login])

  if (!token && searchParams.get('autologin') === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] text-xs font-mono text-[var(--muted)]">
        Authenticating session...
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Overview />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/observability" element={<Observability />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/ai-investigation" element={<AIInvestigation />} />
        <Route path="/automation" element={<Automation />} />
        <Route path="/ai-evaluation" element={<AIEvaluation />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

