import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState { theme: 'light' | 'dark'; toggle(): void; setTheme(t: 'light' | 'dark'): void }

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: typeof window !== 'undefined' && window.location.search.includes('theme=dark') ? 'dark' : 'light',
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      setTheme: (t) => {
        set({ theme: t })
        document.documentElement.classList.toggle('dark', t === 'dark')
      },
    }),
    {
      name: 'hto-theme',
      onRehydrateStorage: () => (s) => {
        const isDark = (s && s.theme === 'dark') || (typeof window !== 'undefined' && window.location.search.includes('theme=dark'))
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }
  )
)

