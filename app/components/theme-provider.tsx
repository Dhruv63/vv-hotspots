'use client'

import { createContext, useContext, useEffect } from 'react'
import { themes, type ThemeId } from '@/app/lib/themes'

const ThemeContext = createContext<{
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}>({
  theme: 'cyberpunk',
  setTheme: () => {}
})

export function ThemeProvider({
  children,
  initialTheme
}: {
  children: React.ReactNode
  initialTheme: ThemeId
}) {
  useEffect(() => {
    // Fallback to cyberpunk if initialTheme is invalid
    const activeTheme = themes[initialTheme] || themes.cyberpunk
    const themeColors = activeTheme.colors

    document.documentElement.style.setProperty('--color-primary', themeColors.primary)
    document.documentElement.style.setProperty('--color-secondary', themeColors.secondary)
    document.documentElement.style.setProperty('--color-accent', themeColors.accent)
    document.documentElement.style.setProperty('--color-bg', themeColors.bg)
    document.documentElement.style.setProperty('--color-text', themeColors.text)
  }, [initialTheme])

  return (
    <ThemeContext.Provider value={{ theme: initialTheme, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
