import { useEffect } from 'react'
import { useThemeStore } from '../../store/themeStore.js'

export default function ThemeEffect() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  const setSystemTheme = useThemeStore((s) => s.setSystemTheme)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [setSystemTheme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-transition')
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    const timer = window.setTimeout(() => root.classList.remove('theme-transition'), 250)
    return () => window.clearTimeout(timer)
  }, [resolvedTheme])

  return null
}
