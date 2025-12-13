export type ThemeId = 'cyberpunk' | 'genshin' | 'lofi' | 'rdr2'

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
  genshin: {
    id: 'genshin',
    name: 'Genshin Impact',
    tagline: 'Fantasy world adventure',
    colors: {
      primary: '#D4AF37',   // Gold
      secondary: '#4A90E2', // Sky Blue
      accent: '#9E7CC1',    // Electro Purple
      bg: '#F0F4F8',        // Cloud White
      text: '#333333'       // Dark Gray
    }
  },
  lofi: {
    id: 'lofi',
    name: 'Lofi Cafe',
    tagline: 'Chill beats to relax to',
    colors: {
      primary: '#C0A080',   // Latte
      secondary: '#8C705F', // Mocha
      accent: '#D4A373',    // Caramel
      bg: '#E6DCCF',        // Paper/Cream
      text: '#4E4237'       // Coffee
    }
  },
  rdr2: {
    id: 'rdr2',
    name: 'RDR2',
    tagline: 'Outlaws for life',
    colors: {
      primary: '#C0392B',   // Blood Red
      secondary: '#D35400', // Rust
      accent: '#F1C40F',    // Badge Gold
      bg: '#2C241B',        // Dark Leather
      text: '#D6CDBB'       // Old Paper
    }
  }
}
