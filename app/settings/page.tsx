import { getUserTheme } from '@/app/actions/theme'
import ThemeSelector from './theme-selector'

export default async function SettingsPage() {
  const currentTheme = await getUserTheme()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Appearance</h2>
        <ThemeSelector currentTheme={currentTheme} />
      </section>
    </div>
  )
}
