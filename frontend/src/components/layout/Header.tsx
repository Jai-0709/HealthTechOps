import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Sun, Moon, LogOut, Search, User, Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api/client'
import { BrandLogo } from '../ui/BrandLogo'
import { CommandPalette } from '../ui/CommandPalette'

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

    const handleOpenSearch = () => setPaletteOpen(true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-omni-search', handleOpenSearch)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-omni-search', handleOpenSearch)
    }
  }, [])

  const { data: overview } = useQuery({
    queryKey: ['overview-health'],
    queryFn: () => api.get<any>('/overview'),
    refetchInterval: 30000,
  })

  return (
    <>
      <header className="sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 bg-[var(--canvas)]/95 backdrop-blur-md border-b border-[var(--hairline)] flex-shrink-0">
        {/* Left Segment: Mobile Brand & Desktop Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Drawer Trigger */}
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors active:scale-95 flex-shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu size={18} />
          </button>

          {/* Mobile Brand Emblem & Typography (Single line, non-wrapping) */}
          <div
            className="md:hidden flex items-center gap-2 min-w-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <BrandLogo size="sm" showText={false} />
            <span
              className="text-lg font-normal tracking-tight text-[var(--ink)] truncate leading-none"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              HealthTechOps
            </span>
          </div>

          {/* Desktop OmniSearch Trigger Bar */}
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

        {/* Right Segment: Mode Changer + Bell + Profile (Clean & Structured) */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto flex-shrink-0">
          {/* Mode Changer / Theme Switcher (Available on both Mobile & Desktop) */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors active:scale-95 cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-[#e8a55a]" />
            ) : (
              <Moon size={16} className="text-[#cc785c]" />
            )}
          </button>

          {/* Incident Notification Bell */}
          <button
            onClick={() => navigate('/incidents?severity=CRITICAL')}
            className="relative w-9 h-9 rounded-lg border border-[var(--hairline)] bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer active:scale-95"
            title="Active critical incidents"
          >
            <Bell size={16} />
            {(overview?.incidents?.critical ?? 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[var(--canvas)]" />
            )}
          </button>

          {/* User Identity Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2.5 border-l border-[var(--hairline)]">
            <button
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-medium text-xs flex-shrink-0 shadow-xs cursor-pointer hover:opacity-90 active:scale-95 transition-opacity"
              title={user?.full_name || 'User Profile'}
            >
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={14} />}
            </button>
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
              className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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
