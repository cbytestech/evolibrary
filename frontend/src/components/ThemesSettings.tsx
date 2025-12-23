// File: frontend/src/components/ThemesSettings.tsx
// Add this to your Settings page

import { useState, useEffect } from 'react'
import { THEMES, getUnlockedThemes, type Theme } from '../data/morphoEvolution'

interface ThemesSettingsProps {
  onThemeChange?: (themeId: string) => void
  currentTheme?: string
}

export function ThemesSettings({ onThemeChange, currentTheme = 'morpho' }: ThemesSettingsProps) {
  const [devMode, setDevMode] = useState(false)
  const [unlockedThemes, setUnlockedThemes] = useState<Theme[]>([])
  const [selectedPreview, setSelectedPreview] = useState<Theme | null>(null)

  useEffect(() => {
    loadThemes()
  }, [devMode])

  const loadThemes = () => {
    // Load unlocked achievements from localStorage
    const saved = localStorage.getItem('evolibrary_achievements')
    const unlockedAchievements = saved ? JSON.parse(saved) : []
    
    // Get dev mode from localStorage
    const savedDevMode = localStorage.getItem('evolibrary_dev_mode') === 'true'
    setDevMode(savedDevMode)
    
    // Get unlocked themes
    const themes = getUnlockedThemes(unlockedAchievements, savedDevMode)
    setUnlockedThemes(themes)
  }

  const toggleDevMode = () => {
    const newDevMode = !devMode
    setDevMode(newDevMode)
    localStorage.setItem('evolibrary_dev_mode', String(newDevMode))
    loadThemes()
  }

  const applyTheme = (theme: Theme) => {
    if (theme.locked && !devMode) return
    
    localStorage.setItem('colorTheme', theme.id)
    if (onThemeChange) {
      onThemeChange(theme.id)
    }
    setSelectedPreview(null)
  }

  const getCategoryIcon = (id: string) => {
    if (id === 'morpho') return '🦋'
    if (id === 'homestead') return '🏡'
    if (id === 'midnight') return '🌙'
    if (id === 'alexandria') return '🏛️'
    if (id === 'cyber') return '⚡'
    if (id === 'forest') return '🌲'
    if (id === 'royal') return '👑'
    if (id === 'minimalist') return '⚪'
    return '🎨'
  }

  return (
    <div className="space-y-6">
      
      {/* Dev Mode Toggle */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
              <span>🛠️</span> Developer Mode
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Unlock all themes for testing and preview
            </p>
          </div>
          <button
            onClick={toggleDevMode}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              devMode
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {devMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Themes Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🎨 Available Themes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedThemes.map(theme => {
            const isLocked = theme.locked && !devMode
            const isCurrent = currentTheme === theme.id

            return (
              <div
                key={theme.id}
                className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all ${
                  isCurrent ? 'ring-2 ring-morpho-primary' : ''
                } ${isLocked ? 'opacity-60' : 'hover:shadow-xl cursor-pointer'}`}
                onClick={() => !isLocked && applyTheme(theme)}
              >
                {/* Theme Preview Banner */}
                <div 
                  className={`h-24 bg-gradient-to-r ${theme.preview.gradient} relative`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.preview.primary}, ${theme.preview.secondary})`
                  }}
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-4xl">🔒</span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 px-2 py-1 rounded text-xs font-bold">
                      ✓ Active
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{theme.emoji}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {theme.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {theme.description}
                  </p>

                  {/* Unlock Requirement */}
                  {isLocked ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded p-2">
                      🔒 {theme.unlockRequirement}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          applyTheme(theme)
                        }}
                        className="flex-1 px-3 py-2 rounded bg-morpho-primary hover:bg-morpho-dark text-white text-sm font-semibold transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPreview(theme)
                        }}
                        className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold transition-colors"
                      >
                        Preview
                      </button>
                    </div>
                  )}

                  {/* Theme Attributes */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {theme.styles.cardRadius}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {theme.styles.fontFamily}
                    </span>
                    {theme.styles.animation && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        ✨ Animated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{selectedPreview.emoji}</span>
                {selectedPreview.name} Preview
              </h3>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Theme Showcase */}
            <div className={`${selectedPreview.styles.backgroundLight} ${selectedPreview.styles.backgroundDark} p-6 rounded-lg mb-4`}>
              <div className={`bg-white dark:bg-gray-800 ${selectedPreview.styles.cardRadius} ${selectedPreview.styles.cardShadow} p-4 mb-4`}>
                <h4 className={`text-lg font-bold mb-2 ${selectedPreview.styles.fontFamily}`}>
                  Sample Card
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  This is how cards will look with this theme applied.
                </p>
                <button className={`px-4 py-2 ${selectedPreview.styles.buttonRadius} ${selectedPreview.styles.buttonStyle} text-white font-semibold transition-colors`}>
                  Sample Button
                </button>
              </div>

              {/* Color Palette */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div 
                    className="h-12 rounded mb-1"
                    style={{ background: selectedPreview.preview.primary }}
                  />
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">Primary</p>
                </div>
                <div>
                  <div 
                    className="h-12 rounded mb-1"
                    style={{ background: selectedPreview.preview.secondary }}
                  />
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">Secondary</p>
                </div>
                <div>
                  <div 
                    className="h-12 rounded mb-1"
                    style={{ background: selectedPreview.preview.accent }}
                  />
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">Accent</p>
                </div>
                <div>
                  <div 
                    className={`h-12 rounded mb-1 bg-gradient-to-r ${selectedPreview.preview.gradient}`}
                  />
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">Gradient</p>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => {
                applyTheme(selectedPreview)
                setSelectedPreview(null)
              }}
              className="w-full px-6 py-3 bg-morpho-primary hover:bg-morpho-dark text-white font-bold rounded-lg transition-colors"
            >
              Apply {selectedPreview.name} Theme
            </button>
          </div>
        </div>
      )}
    </div>
  )
}