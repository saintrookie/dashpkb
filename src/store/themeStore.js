import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'system',
      systemTheme: getSystemTheme(),
      resolvedTheme: getSystemTheme(),

      setTheme: (theme) => {
        set((state) => ({
          theme,
          resolvedTheme: theme === 'system' ? state.systemTheme : theme,
        }))
      },

      setSystemTheme: (systemTheme) => {
        set((state) => ({
          systemTheme,
          resolvedTheme: state.theme === 'system' ? systemTheme : state.resolvedTheme,
        }))
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
      // Persisted state only ever contains `theme`. Recompute resolvedTheme from the
      // *current* (fresh, correctly-detected) systemTheme rather than referencing the
      // store binding from within this callback — persist's rehydration runs
      // synchronously for localStorage, before `const useThemeStore = ...` finishes
      // initializing, so `useThemeStore` would still be undefined at call time.
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...persistedState }
        return {
          ...merged,
          resolvedTheme: merged.theme === 'system' ? currentState.systemTheme : merged.theme,
        }
      },
    },
  ),
)
