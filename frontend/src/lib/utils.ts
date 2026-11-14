import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatDuration(start: string, end?: string | null): string {
  const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export function severityColor(s: string) {
  return s === 'CRITICAL' ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950'
    : s === 'HIGH' ? 'text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-950'
    : s === 'MEDIUM' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-950'
    : s === 'LOW' ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950'
    : 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
}

export function statusColor(s: string) {
  return ['HEALTHY','RESOLVED','CLOSED','COMPLETED'].includes(s)
    ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-950'
    : ['DEGRADED','INVESTIGATING','ACKNOWLEDGED','EXECUTING'].includes(s)
    ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-950'
    : ['DOWN','OPEN','FAILED','REJECTED'].includes(s)
    ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950'
    : ['PENDING','RUNNING','REMEDIATION_PENDING'].includes(s)
    ? 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-950'
    : 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'
}

