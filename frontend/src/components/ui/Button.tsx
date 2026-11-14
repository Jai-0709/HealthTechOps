import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary)] select-none'

  const variants = {
    primary:
      'bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] active:scale-[0.99] shadow-sm',
    secondary:
      'bg-[var(--surface-elevated)] dark:bg-[var(--surface-card)] text-[var(--ink)] border border-[var(--hairline)] hover:bg-[var(--surface-soft)] active:scale-[0.99] shadow-xs',
    dark:
      'bg-[var(--surface-dark-elevated)] text-[var(--on-dark)] border border-[var(--hairline)] hover:bg-[var(--surface-dark-soft)] active:scale-[0.99]',
    ghost:
      'text-[var(--body)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] active:scale-[0.99]',
    destructive:
      'bg-[var(--error)] text-white hover:opacity-90 active:scale-[0.99]',
    outline:
      'border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--surface-soft)] active:scale-[0.99]',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
