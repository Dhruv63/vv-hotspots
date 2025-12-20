'use client'

import { themes, ThemeId } from '@/lib/themes'
import { updateUserTheme } from '@/app/actions/theme'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useTheme()

  const handleThemeChange = async (themeId: string) => {
    setTheme(themeId as ThemeId)
    localStorage.setItem('user-theme', themeId)

    const result = await updateUserTheme(themeId)
    if (result.success) {
      toast.success('Theme updated! Refreshing...')
      setTimeout(() => window.location.reload(), 500)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Color Theme</h3>
      <p className="text-sm text-muted-foreground">Choose your visual style</p>

      <div className="grid grid-cols-2 gap-4">
        {Object.values(themes).map(theme => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-xl ${
              currentTheme === theme.id
                ? 'border-primary ring-2 ring-primary/50 bg-primary/10 shadow-lg'
                : 'border-border hover:border-foreground/20 bg-card shadow-md'
            }`}
          >
            <div
              className="h-16 rounded-xl mb-3 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
              }}
            />
            <h4 className="font-bold text-foreground mb-1">{theme.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{theme.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
