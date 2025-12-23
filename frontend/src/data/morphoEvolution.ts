// File: frontend/src/data/morphoEvolution.ts

export type MorphoStage = 'grub' | 'cocoon' | 'butterfly'

export interface MorphoEvolution {
  stage: MorphoStage
  emoji: string
  name: string
  description: string
  unlockRequirement: string
  achievementId: string
}

export const MORPHO_STAGES: MorphoEvolution[] = [
  {
    stage: 'grub',
    emoji: '🐛',
    name: 'Baby Grub',
    description: 'Your journey begins! A tiny grub starting its collection.',
    unlockRequirement: 'Default - Start of your journey',
    achievementId: 'start'
  },
  {
    stage: 'cocoon',
    emoji: '🥚',
    name: 'Growing Cocoon',
    description: 'Your library is transforming! The metamorphosis has begun.',
    unlockRequirement: 'Collect 50 books',
    achievementId: 'collector_50'
  },
  {
    stage: 'butterfly',
    emoji: '🦋',
    name: 'Morpho Butterfly',
    description: 'Fully evolved! Your library has reached its beautiful form.',
    unlockRequirement: 'Collect 100 books',
    achievementId: 'collector_100'
  }
]

export interface Theme {
  id: string
  name: string
  description: string
  emoji: string
  unlockRequirement: string
  achievementId: string
  locked: boolean
  preview: {
    primary: string
    secondary: string
    accent: string
    gradient: string
  }
  styles: {
    // Background gradients
    backgroundLight: string
    backgroundDark: string
    
    // Card styles
    cardRadius: string
    cardShadow: string
    
    // Button styles
    buttonRadius: string
    buttonStyle: string
    
    // Font family
    fontFamily: string
    
    // Special effects
    glowEffect?: string
    animation?: string
  }
}

export const THEMES: Theme[] = [
  {
    id: 'morpho',
    name: 'Morpho Blue',
    description: 'The default vibrant blue-green theme',
    emoji: '🦋',
    unlockRequirement: 'Default theme',
    achievementId: 'start',
    locked: false,
    preview: {
      primary: '#10b981',
      secondary: '#3b82f6',
      accent: '#06b6d4',
      gradient: 'from-emerald-400 to-blue-500'
    },
    styles: {
      backgroundLight: 'bg-gray-50',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900',
      cardRadius: 'rounded-lg',
      cardShadow: 'shadow-lg hover:shadow-xl',
      buttonRadius: 'rounded-lg',
      buttonStyle: 'bg-morpho-primary hover:bg-morpho-dark',
      fontFamily: 'font-sans'
    }
  },
  {
    id: 'homestead',
    name: 'Homestead',
    description: 'Warm autumn colors for cozy reading',
    emoji: '🏡',
    unlockRequirement: 'Unlock by reaching 25 books',
    achievementId: 'collector_25',
    locked: false, // We'll make this unlockable
    preview: {
      primary: '#f59e0b',
      secondary: '#ea580c',
      accent: '#dc2626',
      gradient: 'from-amber-500 to-orange-600'
    },
    styles: {
      backgroundLight: 'bg-amber-50',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-amber-950',
      cardRadius: 'rounded-lg',
      cardShadow: 'shadow-lg hover:shadow-xl',
      buttonRadius: 'rounded-lg',
      buttonStyle: 'bg-orange-600 hover:bg-orange-700',
      fontFamily: 'font-sans'
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Reader',
    description: 'Deep purple theme for late-night reading sessions',
    emoji: '🌙',
    unlockRequirement: 'Add a book between midnight and 4am',
    achievementId: 'midnight_reader',
    locked: true,
    preview: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#a855f7',
      gradient: 'from-purple-600 to-indigo-600'
    },
    styles: {
      backgroundLight: 'bg-purple-50',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-950',
      cardRadius: 'rounded-xl',
      cardShadow: 'shadow-xl hover:shadow-2xl',
      buttonRadius: 'rounded-xl',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700',
      fontFamily: 'font-sans',
      glowEffect: 'shadow-purple-500/50',
      animation: 'animate-pulse'
    }
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    description: 'Classic library theme with serif fonts and elegant styling',
    emoji: '🏛️',
    unlockRequirement: 'Collect 500 books',
    achievementId: 'collector_500',
    locked: true,
    preview: {
      primary: '#92400e',
      secondary: '#78350f',
      accent: '#a16207',
      gradient: 'from-amber-900 to-yellow-800'
    },
    styles: {
      backgroundLight: 'bg-amber-100',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-amber-900 dark:via-yellow-900 dark:to-amber-900',
      cardRadius: 'rounded-sm',
      cardShadow: 'shadow-md hover:shadow-lg border border-amber-800/20',
      buttonRadius: 'rounded-sm',
      buttonStyle: 'bg-amber-900 hover:bg-amber-800 border border-amber-700',
      fontFamily: 'font-serif'
    }
  },
  {
    id: 'cyber',
    name: 'Cyber Archive',
    description: 'Futuristic neon theme for digital collectors',
    emoji: '⚡',
    unlockRequirement: 'Download 100 books',
    achievementId: 'download_100',
    locked: true,
    preview: {
      primary: '#06b6d4',
      secondary: '#0ea5e9',
      accent: '#22d3ee',
      gradient: 'from-cyan-400 to-blue-500'
    },
    styles: {
      backgroundLight: 'bg-slate-100',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-slate-950 dark:via-cyan-950 dark:to-slate-950',
      cardRadius: 'rounded-none',
      cardShadow: 'shadow-lg hover:shadow-cyan-500/50 border-2 border-cyan-500/30',
      buttonRadius: 'rounded-none',
      buttonStyle: 'bg-cyan-500 hover:bg-cyan-400 border-2 border-cyan-400',
      fontFamily: 'font-mono',
      glowEffect: 'shadow-cyan-500/50',
      animation: 'hover:scale-105 transition-transform'
    }
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Natural green theme with organic shapes',
    emoji: '🌲',
    unlockRequirement: 'Have 20 books monitored (Automation Wizard)',
    achievementId: 'automation_wizard',
    locked: true,
    preview: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      gradient: 'from-green-600 to-emerald-600'
    },
    styles: {
      backgroundLight: 'bg-green-50',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-green-950 dark:via-emerald-950 dark:to-green-950',
      cardRadius: 'rounded-3xl',
      cardShadow: 'shadow-lg hover:shadow-2xl',
      buttonRadius: 'rounded-full',
      buttonStyle: 'bg-green-600 hover:bg-green-700',
      fontFamily: 'font-sans'
    }
  },
  {
    id: 'royal',
    name: 'Royal Library',
    description: 'Luxurious gold and purple for master librarians',
    emoji: '👑',
    unlockRequirement: 'Collect 1,000 books (Master Librarian)',
    achievementId: 'collector_1000',
    locked: true,
    preview: {
      primary: '#9333ea',
      secondary: '#a855f7',
      accent: '#f59e0b',
      gradient: 'from-purple-600 to-amber-500'
    },
    styles: {
      backgroundLight: 'bg-purple-50',
      backgroundDark: 'dark:bg-gradient-to-br dark:from-purple-950 dark:via-amber-950 dark:to-purple-950',
      cardRadius: 'rounded-2xl',
      cardShadow: 'shadow-2xl hover:shadow-purple-500/50 border border-amber-500/20',
      buttonRadius: 'rounded-2xl',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600',
      fontFamily: 'font-serif',
      glowEffect: 'shadow-amber-500/50',
      animation: 'hover:scale-105 transition-all'
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple black and white design',
    emoji: '⚪',
    unlockRequirement: 'Perform 100 searches (Treasure Seeker)',
    achievementId: 'search_100',
    locked: true,
    preview: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#808080',
      gradient: 'from-gray-900 to-gray-700'
    },
    styles: {
      backgroundLight: 'bg-white',
      backgroundDark: 'dark:bg-black',
      cardRadius: 'rounded-none',
      cardShadow: 'shadow-none border border-gray-300 dark:border-gray-700',
      buttonRadius: 'rounded-none',
      buttonStyle: 'bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black',
      fontFamily: 'font-mono'
    }
  }
]

export function getMorphoStage(totalBooks: number): MorphoEvolution {
  if (totalBooks >= 100) return MORPHO_STAGES[2] // butterfly
  if (totalBooks >= 50) return MORPHO_STAGES[1]  // cocoon
  return MORPHO_STAGES[0] // grub
}

export function getUnlockedThemes(unlockedAchievements: string[], devMode: boolean = false): Theme[] {
  if (devMode) {
    // In dev mode, unlock all themes
    return THEMES.map(theme => ({ ...theme, locked: false }))
  }
  
  return THEMES.map(theme => {
    const isUnlocked = unlockedAchievements.includes(theme.achievementId) || !theme.locked
    return { ...theme, locked: !isUnlocked }
  })
}