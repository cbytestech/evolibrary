import { useState, useEffect } from 'react'

interface HeaderProps {
  onNavigate?: (page: 'home' | 'library' | 'settings') => void
  currentPage?: 'home' | 'library' | 'settings'
  onThemeChange?: (theme: string) => void
}

export function Header({ onNavigate, currentPage = 'home', onThemeChange }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('morpho')

  useEffect(() => {
    // Check system preference and localStorage
    const savedTheme = localStorage.getItem('theme')
    const savedColorTheme = localStorage.getItem('colorTheme') || 'morpho'
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
    
    setCurrentTheme(savedColorTheme)
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (!isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const changeTheme = (theme: string) => {
    setCurrentTheme(theme)
    localStorage.setItem('colorTheme', theme)
    if (onThemeChange) {
      onThemeChange(theme)
    }
    setShowSettings(false)
  }

  const handleNavigation = (page: 'home' | 'library' | 'settings') => {
    setShowMobileMenu(false)
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient background with backdrop blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/5 dark:from-black/95 dark:via-black/60 dark:to-black/10 backdrop-blur-lg"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-3 group"
          >
            <div className="text-3xl transition-transform group-hover:scale-110">
              🦋
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white group-hover:text-morpho-light transition-colors">
                Evolibrary
              </h1>
              <p className="text-xs text-gray-300 hidden sm:block">
                Evolve Your Reading
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('home')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'home'
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🏠 Home
            </button>
            
            <button
              onClick={() => handleNavigation('library')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'library'
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📚 Library
            </button>

            <button
              onClick={() => handleNavigation('settings')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'settings'
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ⚙️ Settings
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Settings Menu */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Theme settings"
              >
                🎨
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Color Theme
                  </h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => changeTheme('morpho')}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                        currentTheme === 'morpho'
                          ? 'bg-morpho-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-blue-500 rounded"></div>
                        <span className="font-medium">Morpho Blue</span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        Vibrant blue-green gradients
                      </div>
                    </button>

                    <button
                      onClick={() => changeTheme('homestead')}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                        currentTheme === 'homestead'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded"></div>
                        <span className="font-medium">Homestead</span>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        Warm autumn colors
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {showMobileMenu ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => handleNavigation('home')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentPage === 'home'
                    ? 'bg-morpho-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🏠 Home
              </button>
              
              <button
                onClick={() => handleNavigation('library')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentPage === 'library'
                    ? 'bg-morpho-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                📚 Library
              </button>

              <button
                onClick={() => handleNavigation('settings')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentPage === 'settings'
                    ? 'bg-morpho-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                ⚙️ Settings
              </button>

              {/* Mobile Theme Selector */}
              <div className="pt-2 border-t border-white/10 mt-2">
                <p className="text-xs text-gray-400 px-4 mb-2">Theme</p>
                <button
                  onClick={() => changeTheme('morpho')}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                    currentTheme === 'morpho'
                      ? 'bg-morpho-primary text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  🦋 Morpho Blue
                </button>
                <button
                  onClick={() => changeTheme('homestead')}
                  className={`w-full px-4 py-2 rounded-lg text-left transition-all ${
                    currentTheme === 'homestead'
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  🏡 Homestead
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}