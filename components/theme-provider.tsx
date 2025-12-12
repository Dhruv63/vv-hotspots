'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { themes, type ThemeId } from '@/lib/themes'

const ThemeContext = createContext<{
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}>({
  theme: 'cyberpunk',
  setTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>('cyberpunk')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load theme from localStorage first (instant)
    const savedTheme = localStorage.getItem('user-theme') as ThemeId
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }

    // Then fetch from server (sync with DB)
    fetch('/api/theme')
      .then(res => res.json())
      .then(data => {
        if (data.theme && data.theme !== savedTheme) {
          setTheme(data.theme)
          localStorage.setItem('user-theme', data.theme)
          applyTheme(data.theme)
        }
      })
      .catch(() => {})

    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      applyTheme(theme)
    }
  }, [theme, mounted])

  const applyTheme = (themeId: ThemeId) => {
    const themeColors = themes[themeId].colors
    document.documentElement.style.setProperty('--color-primary', themeColors.primary)
    document.documentElement.style.setProperty('--color-secondary', themeColors.secondary)
    document.documentElement.style.setProperty('--color-accent', themeColors.accent)
    document.documentElement.style.setProperty('--color-bg', themeColors.bg)
    document.documentElement.style.setProperty('--color-text', themeColors.text)

    // Add class for tailwind dark mode if needed (or light)
    if (themeId === 'light') {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
    } else {
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
    }
  }

  const updateTheme = (newTheme: ThemeId) => {
    setTheme(newTheme)
    localStorage.setItem('user-theme', newTheme)
    applyTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
