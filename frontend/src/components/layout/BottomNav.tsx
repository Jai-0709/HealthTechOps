import { NavLink } from 'react-router-dom'
import { LayoutDashboard, AlertTriangle, Bot, Globe, Menu } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BottomNavProps {
  onOpenMore(): void
}

const PRIMARY_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
  { to: '/ai-investigation', icon: Bot, label: 'AI Triage' },
  { to: '/services', icon: Globe, label: 'Services' },
]

export function BottomNav({ onOpenMore }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface-soft)]/95 backdrop-blur-md border-t border-[var(--hairline)] flex items-center justify-around px-2 z-30 select-none safe-area-pb"
      aria-label="Mobile Bottom Navigation"
    >
      {PRIMARY_NAV.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors active:scale-95',
              isActive
                ? 'text-[var(--primary)] font-semibold'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'p-1 rounded-lg transition-colors',
                  isActive && 'bg-[var(--primary)]/10'
                )}
              >
                <Icon size={18} />
              </div>
              <span className="mt-0.5 tracking-tight">{label}</span>
            </>
          )}
        </NavLink>
      ))}

      {/* "More" Trigger to open full menu drawer */}
      <button
        onClick={onOpenMore}
        type="button"
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors active:scale-95 cursor-pointer"
        aria-label="Open full navigation drawer"
      >
        <div className="p-1 rounded-lg">
          <Menu size={18} />
        </div>
        <span className="mt-0.5 tracking-tight">More</span>
      </button>
    </nav>
  )
}

