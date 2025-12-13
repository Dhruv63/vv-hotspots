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
    // Check if saved theme exists in our definition (handles legacy theme cleanup)
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Default to cyberpunk if no theme or invalid theme found
      applyTheme('cyberpunk')
    }

    // Then fetch from server (sync with DB)
    fetch('/api/theme')
      .then(res => res.json())
      .then(data => {
        if (data.theme && themes[data.theme as ThemeId] && data.theme !== savedTheme) {
          // Prevent overwriting local preference with default 'cyberpunk' if user is guest/unauthenticated
          if (data.theme === 'cyberpunk' && savedTheme) {
            return
          }
          setTheme(data.theme as ThemeId)
          localStorage.setItem('user-theme', data.theme)
          applyTheme(data.theme as ThemeId)
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
    // Set data-theme attribute which drives the CSS variables in globals.css
    document.documentElement.setAttribute('data-theme', themeId)

    // Helper classes for Tailwind dark mode or other library compatibility
    // Genshin and Lofi are light themes; Cyberpunk and RDR2 are dark themes
    const isLight = themeId === 'genshin' || themeId === 'lofi'

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(isLight ? 'light' : 'dark')
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
