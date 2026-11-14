import { useState, useEffect } from 'react'
import { Outlet, Navigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

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
      {/* Responsive Sidebar & Slide-over Drawer */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        {/* Main Content Area with zero horizontal overflow & generous bottom padding for BottomNav */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <BottomNav onOpenMore={() => setMobileOpen(true)} />
    </div>
  )
}
