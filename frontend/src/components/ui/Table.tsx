import { cn } from '../../lib/utils'

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto w-full', className)}>
      <table className="w-full text-sm border-collapse text-left">{children}</table>
    </div>
  )
}

export function Thead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead
      className={cn(
        'border-b border-[var(--hairline)] bg-[var(--surface-soft)]/40',
        className
      )}
    >
      {children}
    </thead>
  )
}

export function Tbody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn('divide-y divide-[var(--hairline-soft)]', className)}>{children}</tbody>
}

export function Tr({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?(): void
}) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100',
        onClick && 'cursor-pointer hover:bg-[var(--surface-soft)] active:bg-[var(--surface-card)]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Th({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider whitespace-nowrap',
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode
  className?: string
  colSpan?: number
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn('px-4 py-3.5 text-sm text-[var(--body)] align-middle', className)}
    >
      {children}
    </td>
  )
}
