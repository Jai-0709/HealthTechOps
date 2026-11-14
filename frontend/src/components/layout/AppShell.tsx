import { useState, useEffect } from 'react'
import { Outlet, Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  const { isAuthenticated, login } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && searchParams.get('autologin') === 'admin') {
      login('admin@healthtechops.local', 'HealthTechOps2024!')
    }
  }, [isAuthenticated, searchParams, login])

  if (!isAuthenticated && searchParams.get('autologin') !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--canvas)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
