"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { updateUserTheme } from "@/app/actions/theme"

import { CyberButton } from "@/components/ui/cyber-button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <CyberButton variant="ghost" size="sm" className="w-11 h-11 px-0 min-h-[44px] min-w-[44px]">
        <span className="sr-only">Toggle theme</span>
      </CyberButton>
    )
  }

  const handleToggle = async () => {
      // Toggle between default dark (cyberpunk) and default light (genshin)
      const isDark = theme === 'cyberpunk' || theme === 'rdr2'
      const newTheme = isDark ? 'genshin' : 'cyberpunk'

      setTheme(newTheme)
      localStorage.setItem('user-theme', newTheme)
      await updateUserTheme(newTheme)
      window.location.reload()
  }

  return (
    <CyberButton
      variant="ghost"
      size="sm"
      className="w-11 h-11 px-0 min-h-[44px] min-w-[44px]"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 hover:rotate-12 active:rotate-180">
        <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-accent" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-accent" />
      </div>
    </CyberButton>
  )
}
