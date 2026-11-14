import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, LogOut, Search, User, Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { BrandLogo } from '../ui/BrandLogo'

export function Header({ onOpenMobile }: { onOpenMobile?(): void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [search, setSearch] = useState('')

  const { data: overview } = useQuery({
    queryKey: ['overview-health'],
    queryFn: () => api.get<any>('/overview'),
    refetchInterval: 30000,
  })

  const health = (overview?.system_health ?? 'UNKNOWN').toUpperCase()
  const dotColor =
    health === 'HEALTHY'
      ? 'bg-[#5db872]'
      : health === 'DEGRADED'
      ? 'bg-[#e8a55a]'
      : 'bg-[#c64545]'

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[var(--canvas)] border-b border-[var(--hairline)] flex-shrink-0 z-10">
      {/* Left section: Mobile Hamburger + Mobile Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors active:scale-95"
          aria-label="Open mobile navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="md:hidden flex items-center gap-2">
          <BrandLogo size="sm" showText={true} />
        </div>

        {/* Global Search (Desktop only) */}
        <div className="relative w-80 hidden md:block">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                navigate(`/incidents?search=${encodeURIComponent(search.trim())}`)
              }
            }}
            placeholder="Search services, incidents, runbooks... (Press Enter)"
            className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--surface-soft)] text-[var(--ink)] placeholder:text-[var(--muted-soft)] border border-[var(--hairline)] rounded-lg transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* System Health Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--hairline)] bg-[var(--surface-soft)] text-xs text-[var(--body)]">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
            />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
          </span>
          <span className="font-medium tracking-tight">System {health}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Incident Notification Bell */}
        <button
          onClick={() => navigate('/incidents?severity=CRITICAL')}
          className="relative w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
          title="Active critical incidents"
        >
          <Bell size={15} />
          {(overview?.incidents?.critical ?? 0) > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c64545] rounded-full ring-2 ring-[var(--canvas)]" />
          )}
        </button>

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[var(--hairline)]">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-medium text-xs flex-shrink-0 shadow-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          {user && (
            <div className="hidden lg:block text-left">
              <div className="text-xs font-medium text-[var(--ink)] leading-snug">
                {user.full_name}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">
                {user.role}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[#c64545] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  )
}
