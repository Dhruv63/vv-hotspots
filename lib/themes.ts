export type ThemeId = 'cyberpunk' | 'light' | 'dark'

export const themes: Record<ThemeId, { colors: { primary: string, secondary: string, accent: string, bg: string, text: string } }> = {
  cyberpunk: {
    colors: {
      primary: '#E8FF00',
      secondary: '#FF006E',
      accent: '#00D9FF',
      bg: '#0A0E27',
      text: '#B0B9C1'
    }
  },
  light: {
    colors: {
      primary: '#FF006E',
      secondary: '#E8FF00',
      accent: '#00D9FF',
      bg: '#FFFFFF',
      text: '#0A0E27'
    }
  },
  dark: {
    colors: {
      primary: '#E8FF00',
      secondary: '#FF006E',
      accent: '#00D9FF',
      bg: '#0A0E27',
      text: '#B0B9C1'
    }
  }
}
