export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-[var(--muted)] mb-4 opacity-30">{icon}</div>}
      <h3 className="text-sm font-medium text-[var(--ink)] mb-1">{title}</h3>
      {description && <p className="text-xs text-[var(--muted)] max-w-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

