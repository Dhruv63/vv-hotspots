export const themes = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    tagline: 'Discover spots. Connect with rebels. Own the night.',
    colors: {
      primary: '#00d9ff',
      secondary: '#ff006e',
      accent: '#b967ff',
      bg: '#0a0e27',
      text: '#ffffff'
    }
  },
  genshin: {
    id: 'genshin',
    name: 'Genshin Impact',
    tagline: 'Explore the world. Find hidden treasures. Start your journey.',
    colors: {
      primary: '#4fc3f7',
      secondary: '#ffd700',
      accent: '#ba68c8',
      bg: '#f5f0e8',
      text: '#2c3e50'
    }
  },
  lofi: {
    id: 'lofi',
    name: 'Lofi Cafe',
    tagline: 'Chill vibes only. Find your favorite spots. Stay cozy.',
    colors: {
      primary: '#d4a574',
      secondary: '#f5e6d3',
      accent: '#e89b6f',
      bg: '#1a1410',
      text: '#f5e6d3'
    }
  },
  rdr2: {
    id: 'rdr2',
    name: 'Red Dead Redemption 2',
    tagline: 'Ride into the sunset. Mark your territory. Live free.',
    colors: {
      primary: '#c85a3e',
      secondary: '#d9b18f',
      accent: '#8b6f47',
      bg: '#1c1410',
      text: '#f4e8d8'
    }
  }
}

export type ThemeId = keyof typeof themes
