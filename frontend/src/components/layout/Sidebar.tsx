import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { BrandLogo } from '../ui/BrandLogo'
import {
  LayoutDashboard,
  Server,
  Globe,
  Activity,
  AlertTriangle,
  Bot,
  Wrench,
  Target,
  FlaskConical,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/infrastructure', icon: Server, label: 'Infrastructure' },
  { to: '/services', icon: Globe, label: 'Services' },
  { to: '/observability', icon: Activity, label: 'Observability' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/ai-investigation', icon: Bot, label: 'AI Investigation' },
  { to: '/automation', icon: Wrench, label: 'Automation & Runbooks' },
  { to: '/reliability', icon: Target, label: 'Reliability & SLO' },
  { to: '/ai-evaluation', icon: FlaskConical, label: 'AI Benchmark & Eval' },
  { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}: {
  collapsed: boolean
  onToggle(): void
  mobileOpen?: boolean
  onCloseMobile?(): void
}) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Out Drawer (Senior Mobile Ergonomics) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-[var(--surface-soft)] border-r border-[var(--hairline)] flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl safe-area-pt safe-area-pb',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Drawer Header with Close Button */}
        <div className="flex items-center justify-between h-16 border-b border-[var(--hairline)] px-4 flex-shrink-0">
          <BrandLogo size="md" showText={true} subtitle="Navigation Menu" />
          <button
            onClick={onCloseMobile}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors active:scale-95 cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>



        {/* Mobile Navigation List with large touch targets */}
        <nav className="flex-1 py-2 px-3 overflow-y-auto space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3.5 py-3 px-3.5 rounded-xl text-sm transition-all duration-150 active:scale-[0.98]',
                  isActive
                    ? 'bg-[#e8e0d2] dark:bg-[#252320] text-[var(--ink)] font-semibold border-l-4 border-[var(--primary)] shadow-xs'
                    : 'text-[var(--body)] hover:bg-[var(--surface-card)] hover:text-[var(--ink)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
                    )}
                  />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full bg-[var(--surface-soft)] border-r border-[var(--hairline)] transition-all duration-200 flex-shrink-0 select-none',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Desktop Brand Header */}
        <div
          className={cn(
            'flex items-center h-16 border-b border-[var(--hairline)] flex-shrink-0 px-4',
            collapsed ? 'justify-center px-0' : 'justify-between'
          )}
        >
          <BrandLogo size="md" showText={!collapsed} />
        </div>



        {/* Desktop Navigation List */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 py-2 px-3 rounded-lg text-sm transition-all duration-150',
                  collapsed ? 'justify-center px-0 h-10 w-10 mx-auto' : 'w-full',
                  isActive
                    ? 'bg-[#e8e0d2] dark:bg-[#252320] text-[var(--ink)] font-medium border-l-2 border-[var(--primary)] shadow-xs'
                    : 'text-[var(--body)] hover:bg-[var(--surface-card)] hover:text-[var(--ink)]'
                )
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={cn(
                      'flex-shrink-0 transition-colors',
                      isActive ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
                    )}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Collapse / Expand Footer */}
        <div className="p-2 border-t border-[var(--hairline)] flex-shrink-0">
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center w-full h-9 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] transition-colors text-xs font-medium cursor-pointer',
              collapsed ? 'px-0' : 'gap-2 px-3 justify-start'
            )}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
