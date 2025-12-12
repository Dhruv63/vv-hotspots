'use client'

import { themes } from '@/app/lib/themes'
import { updateUserTheme } from '@/app/actions/theme'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ThemeSelector({ currentTheme }: { currentTheme: string }) {
  const router = useRouter()

  const handleThemeChange = async (themeId: string) => {
    const result = await updateUserTheme(themeId)
    if (result.success) {
      toast.success('Theme updated!')
      router.refresh()
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.values(themes).map(theme => (
        <button
          key={theme.id}
          onClick={() => handleThemeChange(theme.id)}
          className={`p-4 rounded-lg border-2 ${
            currentTheme === theme.id ? 'border-primary' : 'border-gray-700'
          }`}
        >
          <div
            className="h-20 rounded mb-2"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
            }}
          />
          <h3 className="font-bold">{theme.name}</h3>
          <p className="text-sm text-gray-400">{theme.tagline}</p>
        </button>
      ))}
    </div>
  )
}
