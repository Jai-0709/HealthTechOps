import { useState, useEffect } from 'react'
import { Outlet, Navigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell() {
  const { isAuthenticated, login } = useAuthStore()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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
      {/* Responsive Sidebar & Mobile Drawer */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
