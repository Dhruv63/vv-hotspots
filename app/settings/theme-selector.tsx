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
      <h3 className="text-lg font-semibold font-mono text-cyber-light">Color Theme</h3>
      <p className="text-sm text-cyber-gray">Choose your visual style</p>

      <div className="grid grid-cols-2 gap-4">
        {Object.values(themes).map(theme => (
          <button
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              currentTheme === theme.id
                ? 'border-cyber-primary ring-2 ring-cyber-primary/50 bg-cyber-primary/10'
                : 'border-cyber-gray/30 hover:border-cyber-gray bg-cyber-black'
            }`}
          >
            <div
              className="h-16 rounded-lg mb-3 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
              }}
            />
            <h4 className="font-bold text-cyber-light mb-1 font-mono">{theme.name}</h4>
            <p className="text-xs text-cyber-gray line-clamp-2">{theme.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
