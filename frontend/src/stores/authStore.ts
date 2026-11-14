import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from '../types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, token: null, isAuthenticated: false,
      login: async (email, password) => {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Login failed') }
        const data = await res.json()
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'hto-auth' }
  )
)
