// File: frontend/src/data/achievements.ts

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'collection' | 'search' | 'download' | 'hidden' | 'evolution'
  requirement: number
  hidden?: boolean  // Hidden achievements don't show until unlocked
  unlocks_theme?: string  // Theme unlocked by this achievement
  evolution_stage?: 'grub' | 'cocoon' | 'butterfly'  // Morpho evolution stages
}

export const ACHIEVEMENTS: Achievement[] = [
  // Evolution Achievements - Morpho's Journey 🦋
  {
    id: 'morpho_grub',
    name: 'Morpho Awakens',
    description: 'The grub begins its journey - Add your first book',
    icon: '🐛',
    category: 'evolution',
    requirement: 1,
    evolution_stage: 'grub',
    unlocks_theme: 'morpho'
  },
  {
    id: 'morpho_cocoon',
    name: 'Transformation Begins',
    description: 'Enter the cocoon stage - Collect 25 books',
    icon: '🥚',
    category: 'evolution',
    requirement: 25,
    evolution_stage: 'cocoon',
    unlocks_theme: 'cocoon'
  },
  {
    id: 'morpho_butterfly',
    name: 'Metamorphosis Complete',
    description: 'The butterfly emerges! Collect 100 books',
    icon: '🦋',
    category: 'evolution',
    requirement: 100,
    evolution_stage: 'butterfly',
    unlocks_theme: 'butterfly'
  },

  // Collection Achievements
  {
    id: 'collector_10',
    name: 'Modest Collection',
    description: 'Collect 10 books',
    icon: '📚',
    category: 'collection',
    requirement: 10
  },
  {
    id: 'collector_25',
    name: 'Growing Library',
    description: 'Collect 25 books - Unlocks Homestead theme!',
    icon: '🏡',
    category: 'collection',
    requirement: 25
  },
  {
    id: 'collector_50',
    name: 'Book Lover',
    description: 'Collect 50 books - Your grub becomes a cocoon!',
    icon: '🥚',
    category: 'collection',
    requirement: 50
  },
  {
    id: 'collector_200',
    name: 'Library Curator',
    description: 'Collect 200 books',
    icon: '🏛️',
    category: 'collection',
    requirement: 200
  },
  {
    id: 'collector_500',
    name: 'Alexandria Reborn',
    description: 'Collect 500 books',
    icon: '🏛️',
    category: 'collection',
    requirement: 500
  },
  {
    id: 'collector_1000',
    name: 'Master Librarian',
    description: 'Collect 1,000 books',
    icon: '👑',
    category: 'collection',
    requirement: 1000
  },

  // Search Achievements
  {
    id: 'first_search',
    name: 'Explorer',
    description: 'Perform your first search',
    icon: '🔍',
    category: 'search',
    requirement: 1
  },
  {
    id: 'search_10',
    name: 'Book Hunter',
    description: 'Perform 10 searches',
    icon: '🎯',
    category: 'search',
    requirement: 10
  },
  {
    id: 'search_100',
    name: 'Treasure Seeker',
    description: 'Perform 100 searches',
    icon: '🗺️',
    category: 'search',
    requirement: 100
  },

  // Download Achievements
  {
    id: 'first_download',
    name: 'Download Initiated',
    description: 'Download your first book',
    icon: '⬇️',
    category: 'download',
    requirement: 1
  },
  {
    id: 'download_10',
    name: 'Avid Collector',
    description: 'Download 10 books',
    icon: '💾',
    category: 'download',
    requirement: 10
  },
  {
    id: 'download_50',
    name: 'Data Hoarder',
    description: 'Download 50 books',
    icon: '💿',
    category: 'download',
    requirement: 50
  },
  {
    id: 'download_100',
    name: 'Download Master',
    description: 'Download 100 books',
    icon: '📥',
    category: 'download',
    requirement: 100
  },

  // Hidden Achievements
  {
    id: 'midnight_reader',
    name: 'Midnight Reader',
    description: 'Add a book between midnight and 4am',
    icon: '🌙',
    category: 'hidden',
    requirement: 1,
    hidden: true
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Download 10 books in one hour',
    icon: '⚡',
    category: 'hidden',
    requirement: 10,
    hidden: true
  },
  {
    id: 'genre_master',
    name: 'Genre Master',
    description: 'Collect books from 10 different genres',
    icon: '🎭',
    category: 'hidden',
    requirement: 10,
    hidden: true
  },
  {
    id: 'automation_wizard',
    name: 'Automation Wizard',
    description: 'Have 20 books monitored simultaneously',
    icon: '🧙',
    category: 'hidden',
    requirement: 20,
    hidden: true
  },
  {
    id: 'morpho_discovered',
    name: 'Morpho Discovered',
    description: 'You found the butterfly! 🦋',
    icon: '🦋',
    category: 'hidden',
    requirement: 1,
    hidden: true
  }
]

export interface UserProgress {
  total_books: number
  total_searches: number
  total_downloads: number
  monitored_books: number
  genres_collected: number
  downloads_last_hour: number
  unlocked_achievements: string[]
}

export function checkAchievements(progress: UserProgress): Achievement[] {
  const newlyUnlocked: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (progress.unlocked_achievements.includes(achievement.id)) {
      continue
    }

    let shouldUnlock = false

    // Check collection achievements
    if (achievement.category === 'collection' && progress.total_books >= achievement.requirement) {
      shouldUnlock = true
    }

    // Check search achievements
    if (achievement.category === 'search' && progress.total_searches >= achievement.requirement) {
      shouldUnlock = true
    }

    // Check download achievements
    if (achievement.category === 'download' && progress.total_downloads >= achievement.requirement) {
      shouldUnlock = true
    }

    // Check hidden achievements
    if (achievement.id === 'automation_wizard' && progress.monitored_books >= 20) {
      shouldUnlock = true
    }

    if (achievement.id === 'genre_master' && progress.genres_collected >= 10) {
      shouldUnlock = true
    }

    if (achievement.id === 'speed_demon' && progress.downloads_last_hour >= 10) {
      shouldUnlock = true
    }

    if (shouldUnlock) {
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}