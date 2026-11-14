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
      <div className="bg-[var(--surface-elevated)] dark:bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl p-3.5 sm:p-5 animate-pulse shadow-xs">
        <div className="h-3 bg-[var(--surface-soft)] rounded w-20 mb-3" />
        <div className="h-8 bg-[var(--surface-soft)] rounded w-24 mb-2" />
        <div className="h-3 bg-[var(--surface-soft)] rounded w-16" />
      </div>
    )
  }

  const isWord = typeof value === 'string' && isNaN(Number(value)) && value.length > 2
  const formattedValue = isWord
    ? String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase()
    : value

  return (
    <div
      className={cn(
        'bg-[var(--surface-elevated)] dark:bg-[var(--surface-card)] border border-[var(--hairline)] rounded-xl p-3.5 sm:p-5 transition-all shadow-xs hover:border-[var(--muted-soft)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                statusIndicator[status].dot
              )}
            />
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[var(--muted)] truncate">
              {title}
            </p>
          </div>

          <div className="flex items-baseline gap-1 flex-wrap">
            <span
              className={cn(
                'tracking-tight tabular-nums',
                isWord
                  ? 'text-lg sm:text-2xl font-medium text-[var(--ink)]'
                  : 'text-2xl sm:text-3xl font-normal font-serif text-[var(--ink)]'
              )}
            >
              {formattedValue}
            </span>
            {unit && (
              <span className="text-[10px] sm:text-xs font-medium text-[var(--muted)]">
                {unit}
              </span>
            )}
          </div>

          {trendValue && (
            <div className="mt-1 sm:mt-2 flex items-center gap-1 text-[11px] sm:text-xs">
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium truncate',
                  trend === 'up'
                    ? 'text-[var(--success)]'
                    : trend === 'down'
                    ? 'text-[var(--error)]'
                    : 'text-[var(--muted)]'
                )}
              >
                {trend === 'up' ? (
                  <TrendingUp size={11} strokeWidth={2.5} className="shrink-0" />
                ) : trend === 'down' ? (
                  <TrendingDown size={11} strokeWidth={2.5} className="shrink-0" />
                ) : null}
                <span className="truncate">{trendValue}</span>
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--surface-soft)] border border-[var(--hairline-soft)] flex items-center justify-center text-[var(--primary)] shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
