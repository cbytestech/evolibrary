// File: frontend/src/utils/themes.ts
// Centralized theme management - edit here to update all pages!

export type ThemeName = 'morpho' | 'homestead' | 'forest' | 'cyberpunk' | 'royal' | 'minimalist' | 'midnight' | 'alexandria'

export interface ThemeConfig {
  name: string
  background: string
  cardStyle: string
  textPrimary: string
  textSecondary: string
}

/**
 * Get background gradient/color for a theme
 */
export const getThemeBackground = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      // ☕ Espresso & Cream - Cozy book nook (warm brown, deep coffee tones)
      return 'bg-stone-200 dark:bg-gradient-to-b dark:from-stone-900 dark:via-stone-800 dark:to-stone-900'
    
    case 'forest':
      // 🌲 Forest Reading Retreat - Deep greens
      return 'bg-emerald-50 dark:bg-gradient-to-b dark:from-emerald-950 dark:via-green-950 dark:to-emerald-950'
    
    case 'morpho':
      // 🦋 Default Morpho theme
      return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
    
    case 'cyberpunk':
      // 🌃 Cyber Archive theme
      return 'bg-gray-50 dark:bg-gradient-to-br dark:from-purple-950 dark:via-blue-950 dark:to-black'
    
    case 'royal':
      // 👑 Royal Library theme
      return 'bg-gray-50 dark:bg-gradient-to-br dark:from-purple-950 dark:via-indigo-950 dark:to-purple-950'
    
    case 'minimalist':
      // ⚪ Minimalist theme
      return 'bg-white dark:bg-black'
    
    case 'midnight':
      // 🌙 Midnight Reader theme
      return 'bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-blue-950 dark:to-slate-950'
    
    case 'alexandria':
      // 📜 Ancient Alexandria theme
      return 'bg-stone-50 dark:bg-gradient-to-br dark:from-stone-950 dark:via-amber-950 dark:to-stone-950'
    
    default:
      return 'bg-gray-50 dark:bg-gray-900'
  }
}

/**
 * Get card styling with soft faded edges for a theme
 */
export const getThemeCardStyle = (theme: string): string => {
  const baseCard = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg'
  
  switch(theme) {
    case 'homestead':
      // Soft cream cards with warm brown shadows (coffee shop vibes)
      return 'bg-white/90 dark:bg-stone-800/95 rounded-xl shadow-lg backdrop-blur-sm border border-stone-200/20 dark:border-stone-600/40'
    
    case 'forest':
      // Soft green-tinted cards with faded edges
      return 'bg-white/90 dark:bg-emerald-900/80 rounded-xl shadow-lg backdrop-blur-sm border border-emerald-200/20 dark:border-emerald-700/20'
    
    case 'morpho':
      // Soft emerald accent
      return 'bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg backdrop-blur-sm border border-emerald-200/10 dark:border-emerald-700/10'
    
    case 'cyberpunk':
      // Sharp cyber edges with glow
      return 'bg-white/95 dark:bg-purple-950/80 rounded-lg shadow-xl backdrop-blur-sm border border-purple-500/20 dark:border-cyan-500/30'
    
    case 'royal':
      // Elegant royal cards
      return 'bg-white/90 dark:bg-purple-900/80 rounded-xl shadow-lg backdrop-blur-sm border border-purple-200/20 dark:border-purple-700/20'
    
    case 'minimalist':
      // Clean, simple, no frills
      return 'bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800'
    
    case 'midnight':
      // Deep blue cards with glow
      return 'bg-white/90 dark:bg-blue-950/80 rounded-xl shadow-lg backdrop-blur-sm border border-blue-200/20 dark:border-blue-700/20'
    
    case 'alexandria':
      // Ancient parchment feel
      return 'bg-white/90 dark:bg-amber-950/80 rounded-xl shadow-lg backdrop-blur-sm border border-amber-200/20 dark:border-amber-700/20'
    
    default:
      return baseCard
  }
}

/**
 * Get stat card styling (for homepage stats)
 */
export const getThemeStatCard = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      return 'bg-white/95 dark:bg-stone-800/95 rounded-xl shadow-lg backdrop-blur-sm border border-stone-200/30 dark:border-stone-600/50'
    
    case 'forest':
      return 'bg-white/95 dark:bg-emerald-900/90 rounded-xl shadow-lg backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30'
    
    case 'morpho':
      return 'bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-lg backdrop-blur-sm border border-emerald-200/20 dark:border-emerald-700/20'
    
    default:
      return 'bg-white dark:bg-gray-800 rounded-lg shadow-lg'
  }
}

/**
 * Get recommendation box styling (for homepage)
 */
export const getThemeRecommendationBox = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      return 'bg-white/90 dark:bg-stone-800/95 rounded-xl shadow-lg backdrop-blur-sm border border-stone-200/20 dark:border-stone-600/40'
    
    case 'forest':
      return 'bg-white/90 dark:bg-emerald-900/80 rounded-xl shadow-lg backdrop-blur-sm border border-emerald-200/20 dark:border-emerald-700/20'
    
    case 'morpho':
      return 'bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg backdrop-blur-sm'
    
    default:
      return 'bg-white dark:bg-gray-800 rounded-lg shadow-lg'
  }
}

/**
 * Get button styling for theme-specific buttons
 */
export const getThemeButton = (theme: string, variant: 'primary' | 'secondary' = 'primary'): string => {
  if (variant === 'secondary') {
    switch(theme) {
      case 'homestead':
        return 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600'
      case 'forest':
        return 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800 dark:hover:bg-emerald-700'
      default:
        return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
    }
  }
  
  // Primary buttons use morpho-primary by default
  return 'bg-morpho-primary hover:bg-morpho-dark'
}

/**
 * Get Quick Actions panel styling
 */
export const getThemeQuickActionsPanel = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      return 'bg-stone-100/50 dark:bg-stone-900/50 rounded-lg shadow-lg backdrop-blur-sm border border-stone-300/30 dark:border-stone-700/30'
    case 'forest':
      return 'bg-emerald-100/50 dark:bg-emerald-950/50 rounded-lg shadow-lg backdrop-blur-sm border border-emerald-300/30 dark:border-emerald-800/30'
    case 'morpho':
      return 'bg-gradient-to-br from-morpho-primary/10 to-blue-500/10 dark:from-morpho-primary/20 dark:to-blue-500/20 rounded-lg shadow-lg'
    default:
      return 'bg-white dark:bg-gray-800 rounded-lg shadow-lg'
  }
}

/**
 * Get Library Insights panel styling
 */
export const getThemeInsightsPanel = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      return 'bg-stone-100/50 dark:bg-stone-900/50 rounded-lg shadow-lg backdrop-blur-sm border border-stone-300/30 dark:border-stone-700/30'
    case 'forest':
      return 'bg-green-100/50 dark:bg-green-950/50 rounded-lg shadow-lg backdrop-blur-sm border border-green-300/30 dark:border-green-800/30'
    case 'morpho':
      return 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-lg shadow-lg'
    default:
      return 'bg-white dark:bg-gray-800 rounded-lg shadow-lg'
  }
}

/**
 * Get Getting Started box styling
 */
export const getThemeGettingStarted = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      return 'bg-white/90 dark:bg-stone-800/90 rounded-lg shadow backdrop-blur-sm border border-stone-200/20 dark:border-stone-600/30'
    case 'forest':
      return 'bg-white/90 dark:bg-emerald-900/90 rounded-lg shadow backdrop-blur-sm border border-emerald-200/20 dark:border-emerald-700/30'
    default:
      return 'bg-white dark:bg-gray-800 rounded-lg shadow'
  }
}

/**
 * Get text colors for a theme (for text elements that need theme-specific colors)
 */
export const getThemeTextColor = (theme: string, variant: 'primary' | 'secondary' = 'primary'): string => {
  if (variant === 'secondary') {
    switch(theme) {
      case 'homestead':
        return 'text-stone-600 dark:text-stone-400'
      case 'forest':
        return 'text-emerald-600 dark:text-emerald-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }
  
  // Primary text
  switch(theme) {
    case 'homestead':
      return 'text-stone-900 dark:text-stone-100'
    case 'forest':
      return 'text-emerald-900 dark:text-emerald-100'
    default:
      return 'text-gray-900 dark:text-white'
  }
}

/**
 * Get hover background for interactive elements
 */
export const getThemeHoverBg = (theme: string): string => {
  switch(theme) {
    case 'homestead':
      return 'hover:bg-stone-50 dark:hover:bg-stone-700'
    case 'forest':
      return 'hover:bg-emerald-50 dark:hover:bg-emerald-800'
    default:
      return 'hover:bg-gray-50 dark:hover:bg-gray-700'
  }
}

/**
 * Theme descriptions for UI
 */
export const THEME_DESCRIPTIONS: Record<string, string> = {
  morpho: '🦋 Classic emerald theme with evolving mascot',
  homestead: '☕ Cozy reading nook with warm earthy tones',
  forest: '🌲 Deep forest retreat for nature lovers',
  cyberpunk: '🌃 Neon-lit digital archive',
  royal: '👑 Elegant purple and gold library',
  minimalist: '⚪ Clean and distraction-free',
  midnight: '🌙 Dark blue evening reading theme',
  alexandria: '📜 Ancient library aesthetic'
}