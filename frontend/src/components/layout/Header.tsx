import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, LogOut, Search, User, Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { BrandLogo } from '../ui/BrandLogo'
import { CommandPalette } from '../ui/CommandPalette'
import { cn } from '../../lib/utils'

export function Header({ onOpenMobile }: { onOpenMobile?(): void }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Global keyboard shortcuts for Command Palette (⌘K, Ctrl+K, and /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      } else if (e.key === '/' && !isInput) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const { data: overview } = useQuery({
    queryKey: ['overview-health'],
    queryFn: () => api.get<any>('/overview'),
    refetchInterval: 30000,
  })

  const health = (overview?.system_health ?? 'UNKNOWN').toUpperCase()
  const dotColor =
    health === 'HEALTHY'
      ? 'bg-emerald-500'
      : health === 'DEGRADED'
      ? 'bg-amber-500'
      : 'bg-rose-500'

  return (
    <>
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

          {/* High-Power OmniSearch Trigger (Desktop) */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="relative w-72 lg:w-96 hidden md:flex items-center justify-between pl-3 pr-2.5 py-1.5 text-xs bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--hairline)] rounded-lg hover:border-[var(--primary)] hover:bg-[var(--surface-card)] transition-all cursor-pointer group text-left shadow-2xs"
            aria-label="Open command palette search"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search
                size={14}
                className="text-[var(--muted)] group-hover:text-[var(--ink)] transition-colors flex-shrink-0"
              />
              <span className="truncate">Search services, incidents, runbooks...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--hairline)] font-mono text-[10px] text-[var(--muted)] group-hover:text-[var(--ink)]">
              <span className="text-[9px]">Ctrl</span> K
            </kbd>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Mobile Search Button */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="md:hidden p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors active:scale-95"
            aria-label="Open OmniSearch"
            title="Search (Ctrl+K)"
          >
            <Search size={17} />
          </button>

          {/* Calm Enterprise Operational Indicator (No pulsing slop) */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border border-[var(--hairline)] bg-[var(--surface-card)] text-xs text-[var(--body)] select-none">
            <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
            <span className="font-medium tracking-tight">
              {health === 'HEALTHY'
                ? 'Operational'
                : health === 'DEGRADED'
                ? 'Degraded'
                : 'Active Incident'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Jai-0709/HealthTechOps"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors"
            title="GitHub Repository (Jai-0709/HealthTechOps)"
            aria-label="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* Incident Notification Bell */}
          <button
            onClick={() => navigate('/incidents?severity=CRITICAL')}
            className="relative w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
            title="Active critical incidents"
          >
            <Bell size={15} />
            {(overview?.incidents?.critical ?? 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[var(--canvas)]" />
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
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Command OmniSearch Modal */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}
