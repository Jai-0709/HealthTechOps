import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dark' | 'soft'
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  const variants = {
    default:
      'bg-[var(--surface-elevated)] dark:bg-[var(--surface-card)] border border-[var(--hairline)] text-[var(--body)]',
    dark:
      'bg-[var(--surface-dark)] border border-[var(--hairline)] text-[var(--on-dark)]',
    soft:
      'bg-[var(--surface-soft)] border border-[var(--hairline-soft)] text-[var(--body)]',
  }

  return (
    <div className={cn('rounded-xl p-5 transition-all shadow-xs', variants[variant], className)}>
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4 pb-2 border-b border-[var(--hairline-soft)]', className)}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={cn('text-base font-normal tracking-tight text-[var(--ink)] font-serif', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-xs text-[var(--muted)] mt-0.5', className)}>
      {children}
    </p>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--surface-soft)] border border-[var(--hairline)] flex items-center justify-center text-[var(--muted)] mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-medium text-[var(--ink)] mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-[var(--muted)] max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
