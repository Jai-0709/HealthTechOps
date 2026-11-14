import { useAuthStore } from '../stores/authStore'
import { getMockFallback } from './mockData'

const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
export const API_PREFIX = rawBase ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase}/api/v1`) : '/api/v1'

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(`${API_PREFIX}${path}`, { ...options, headers })
    if (res.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    if (res.ok) {
      if (res.status === 204) return undefined as T
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        return await res.json()
      }
    }
  } catch (err: any) {
    if (err?.message === 'Unauthorized') throw err
    // Live backend offline or static CDN returned 405/HTML -> continue to fallback
  }

  // Graceful fallback to high-fidelity synthetic demo data
  const fallback = getMockFallback<T>(path, options.method || 'GET', options.body)
  if (fallback !== undefined) {
    return fallback
  }

  throw new Error(`Endpoint ${path} failed`)
}

export const api = {
  get: <T>(p: string) => req<T>(p),
  post: <T>(p: string, b?: unknown) => req<T>(p, { method: 'POST', body: JSON.stringify(b) }),
  patch: <T>(p: string, b?: unknown) => req<T>(p, { method: 'PATCH', body: JSON.stringify(b) }),
  del: <T>(p: string) => req<T>(p, { method: 'DELETE' }),
}
