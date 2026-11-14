import { cn } from '../../lib/utils'

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'coral'

const variantClass: Record<BadgeVariant, string> = {
  success:
    'bg-[#5db872]/15 text-[#2e7d32] border-[#5db872]/30 dark:bg-[#5db872]/20 dark:text-[#81c784] dark:border-[#5db872]/40',
  danger:
    'bg-[#c64545]/15 text-[#c64545] border-[#c64545]/30 dark:bg-[#c64545]/20 dark:text-[#ef5350] dark:border-[#c64545]/40',
  warning:
    'bg-[#e8a55a]/20 text-[#b25e00] border-[#e8a55a]/40 dark:bg-[#e8a55a]/20 dark:text-[#ffb74d] dark:border-[#e8a55a]/40',
  info:
    'bg-[#5db8a6]/15 text-[#00695c] border-[#5db8a6]/30 dark:bg-[#5db8a6]/20 dark:text-[#4db6ac] dark:border-[#5db8a6]/40',
  neutral:
    'bg-[var(--surface-card)] text-[var(--muted)] border-[var(--hairline)] dark:bg-[var(--surface-dark-elevated)] dark:text-[var(--on-dark-soft)]',
  coral:
    'bg-[var(--primary)] text-white border-transparent shadow-xs',
}

export function Badge({
  children,
  className,
  variant = 'neutral',
}: {
  children: React.ReactNode
  className?: string
  variant?: BadgeVariant
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variantClass[variant],
        className
      )}
    >
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
      ? 'warning'
      : sev === 'MEDIUM'
      ? 'warning'
      : sev === 'LOW'
      ? 'info'
      : 'neutral'

  return <Badge variant={variant}>{sev}</Badge>
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

  return (
    <Badge variant={variant}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 inline-block" />
      {st.replace(/_/g, ' ')}
    </Badge>
  )
}
