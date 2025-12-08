import { useState } from 'react'

interface UISettingsProps {
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export function UISettings({ currentTheme = 'morpho', onThemeChange }: UISettingsProps) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const themes = [
    {
      id: 'morpho',
      name: 'Morpho Blue',
      description: 'Vibrant blue-green gradients inspired by morpho butterflies',
      gradient: 'from-emerald-400 to-blue-500',
      preview: 'bg-gradient-to-br from-emerald-400 to-blue-500'
    },
    {
      id: 'homestead',
      name: 'Homestead',
      description: 'Warm autumn colors with orange and amber tones',
      gradient: 'from-amber-500 to-orange-600',
      preview: 'bg-gradient-to-br from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          🎨 UI Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize the appearance and theme
        </p>
      </div>

      {/* Dark Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          🌙 Dark Mode
        </h2>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Enable Dark Mode
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Use dark theme for better viewing in low light
            </div>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isDark ? 'bg-morpho-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Color Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          🎨 Color Theme
        </h2>
        
        <div className="space-y-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange?.(theme.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                currentTheme === theme.id
                  ? 'border-morpho-primary bg-morpho-primary/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-morpho-primary/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-lg ${theme.preview} shadow-lg flex-shrink-0`} />
                
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-white mb-1">
                    {theme.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {theme.description}
                  </div>
                </div>

                {currentTheme === theme.id && (
                  <div className="text-morpho-primary text-2xl">
                    ✓
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex gap-2">
            <span className="text-blue-600 dark:text-blue-400">💡</span>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              <strong>Tip:</strong> More themes coming soon! Want to create your own? Let us know on GitHub!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}