export type ThemeId = 'cyberpunk' | 'light' | 'dark' | 'retro'

export interface Theme {
  id: ThemeId
  name: string
  tagline: string
  colors: {
    primary: string
    secondary: string
    accent: string
    bg: string
    text: string
  }
}

export const themes: Record<ThemeId, Theme> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    tagline: 'Neon lights and high contrast',
    colors: {
      primary: '#E8FF00',
      secondary: '#FF006E',
      accent: '#00D9FF',
      bg: '#0A0E27',
      text: '#B0B9C1'
    }
  },
  light: {
    id: 'light',
    name: 'Day Mode',
    tagline: 'Clean and bright',
    colors: {
      primary: '#FF006E',
      secondary: '#E8FF00',
      accent: '#00D9FF',
      bg: '#FFFFFF',
      text: '#0A0E27'
    }
  },
  dark: {
    id: 'dark',
    name: 'Night Mode',
    tagline: 'Dark and easy on the eyes',
    colors: {
      primary: '#E8FF00',
      secondary: '#FF006E',
      accent: '#00D9FF',
      bg: '#0A0E27',
      text: '#B0B9C1'
    }
  },
  retro: {
    id: 'retro',
    name: 'Retro Wave',
    tagline: '80s sunset vibes',
    colors: {
      primary: '#FF71CE',
      secondary: '#01CDFE',
      accent: '#05FFA1',
      bg: '#2D1B2E',
      text: '#FFFFFF'
    }
  }
}
