import { cn } from '../../lib/utils'
import { Check, ShieldCheck, AlertCircle } from 'lucide-react'

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'coral'

const variantClass: Record<BadgeVariant, string> = {
  success:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  danger:
    'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  warning:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  info:
    'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
  neutral:
    'bg-[var(--surface-card)] text-[var(--muted)] border-[var(--hairline)]',
  coral:
    'bg-[#cc785c]/10 text-[#cc785c] border-[#cc785c]/25',
}

function formatLabel(str: string): string {
  if (!str) return ''
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  dot = false,
}: {
  children: React.ReactNode
  className?: string
  variant?: BadgeVariant
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight transition-colors select-none',
        variantClass[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />}
      {children}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  const sev = (severity || '').toUpperCase()
  const variant: BadgeVariant =
    sev === 'CRITICAL'
      ? 'danger'
      : sev === 'HIGH'
      ? 'coral'
      : sev === 'MEDIUM'
      ? 'warning'
      : sev === 'LOW'
      ? 'info'
      : 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight transition-colors select-none',
        variantClass[variant]
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          sev === 'CRITICAL'
            ? 'bg-rose-500'
            : sev === 'HIGH'
            ? 'bg-[#cc785c]'
            : sev === 'MEDIUM'
            ? 'bg-amber-500'
            : 'bg-sky-500'
        )}
      />
      <span>{formatLabel(sev)}</span>
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const st = (status || '').toUpperCase()
  const variant: BadgeVariant =
    ['HEALTHY', 'RESOLVED', 'CLOSED', 'COMPLETED'].includes(st)
      ? 'success'
      : ['DEGRADED', 'INVESTIGATING', 'ACKNOWLEDGED', 'EXECUTING'].includes(st)
      ? 'warning'
      : ['DOWN', 'OPEN', 'FAILED', 'REJECTED'].includes(st)
      ? 'danger'
      : ['PENDING', 'RUNNING', 'REMEDIATION_PENDING'].includes(st)
      ? 'info'
      : 'neutral'

  const dotColor =
    variant === 'success'
      ? 'bg-emerald-500'
      : variant === 'warning'
      ? 'bg-amber-500'
      : variant === 'danger'
      ? 'bg-rose-500'
      : 'bg-sky-500'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight transition-colors select-none',
        variantClass[variant]
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
      <span>{formatLabel(st)}</span>
    </span>
  )
}

export function PolicyBadge({ isAllowlisted }: { isAllowlisted: boolean }) {
  if (isAllowlisted) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md select-none">
        <Check size={11} className="stroke-[2.5]" />
        <span>Allowlisted</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted)] bg-[var(--surface-card)] border border-[var(--hairline)] px-2 py-0.5 rounded-md select-none">
      <AlertCircle size={11} />
      <span>Approval Required</span>
    </span>
  )
}

export function RiskBadge({ level }: { level: string }) {
  const lvl = (level || '').toUpperCase()
  const variant: BadgeVariant =
    lvl === 'HIGH' || lvl === 'CRITICAL'
      ? 'danger'
      : lvl === 'MEDIUM'
      ? 'warning'
      : 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border tracking-tight select-none',
        variantClass[variant]
      )}
    >
      {formatLabel(lvl)}
    </span>
  )
}
