import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

type Status = 'healthy' | 'warning' | 'critical' | 'neutral'

interface Props {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  status?: Status
  icon?: React.ReactNode
  loading?: boolean
  className?: string
}

const statusIndicator: Record<Status, { dot: string; label?: string }> = {
  healthy: { dot: 'bg-[var(--success)]' },
  warning: { dot: 'bg-[var(--warning)]' },
  critical: { dot: 'bg-[var(--error)]' },
  neutral: { dot: 'bg-[var(--muted-soft)]' },
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  status = 'neutral',
  icon,
  loading,
  className,
}: Props) {
  if (loading) {
    return (
      <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl p-5 animate-pulse shadow-xs">
        <div className="h-3 bg-[var(--surface-soft)] rounded w-20 mb-3" />
        <div className="h-8 bg-[var(--surface-soft)] rounded w-24 mb-2" />
        <div className="h-3 bg-[var(--surface-soft)] rounded w-16" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-[var(--surface-elevated)] dark:bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl p-5 transition-all shadow-xs hover:border-[var(--muted-soft)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                statusIndicator[status].dot
              )}
            />
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] truncate">
              {title}
            </p>
          </div>

          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl font-normal text-[var(--ink)] tracking-tight font-serif tabular-nums"
            >
              {value}
            </span>
            {unit && (
              <span className="text-xs font-medium text-[var(--muted)]">
                {unit}
              </span>
            )}
          </div>

          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  trend === 'up'
                    ? 'text-[var(--success)]'
                    : trend === 'down'
                    ? 'text-[var(--error)]'
                    : 'text-[var(--muted)]'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp size={12} strokeWidth={2.5} />
                ) : trend === 'down' ? (
                  <TrendingDown size={12} strokeWidth={2.5} />
                ) : (
                  <Minus size={12} strokeWidth={2.5} />
                )}
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline-soft)] flex items-center justify-center text-[var(--primary)] shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
