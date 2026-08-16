export function getChartTheme(isDark) {
  return {
    grid: isDark ? '#1c2a52' : '#eef2f9',
    axisLine: isDark ? '#1c2a52' : '#e3e9f5',
    axisText: isDark ? '#7d8bb3' : '#94a3b8',
    categoryText: isDark ? '#c3cbe0' : '#334155',
    labelText: isDark ? '#ffffff' : '#0b1c4a',
    cursorFill: isDark ? 'rgba(255,255,255,0.04)' : '#f5f7fc',
  }
}
