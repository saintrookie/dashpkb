import { useThemeStore } from '../store/themeStore.js'

export function useTheme() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  return { resolvedTheme, isDark: resolvedTheme === 'dark' }
}
