import { useAuthStore } from '../stores/authStore'

const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const API_PREFIX = rawBase ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`) : '/api/v1'

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_PREFIX}${path}`, { ...options, headers })
  if (res.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login'; throw new Error('Unauthorized') }
  if (!res.ok) { const e = await res.json().catch(() => ({ detail: res.statusText })); throw new Error(e.detail || 'API error') }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(b) }),
  patch: <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH', body: JSON.stringify(b) }),
  del: <T>(p: string) => req<T>(p, { method: 'DELETE' }),
}
