"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { CyberButton } from "@/components/ui/cyber-button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <CyberButton variant="ghost" size="sm" className="w-9 h-9 px-0">
        <span className="sr-only">Toggle theme</span>
      </CyberButton>
    )
  }

  return (
    <CyberButton
      variant="ghost"
      size="sm"
      className="w-9 h-9 px-0"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 hover:rotate-12 active:rotate-180">
        <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-cyber-cyan" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-cyber-cyan" />
      </div>
    </CyberButton>
  )
}
