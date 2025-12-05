import { useState, useEffect } from 'react'

interface HeaderProps {
  onThemeChange?: (theme: string) => void
  onNavigate?: (page: 'home' | 'books') => void
  currentPage?: 'home' | 'books'
}

export function Header({ onThemeChange, onNavigate, currentPage = 'home' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'morpho'
    // Migrate old homestead variants to just 'homestead'
    if (saved === 'homestead-light' || saved === 'homestead-dark') {
      return 'homestead'
    }
    return saved
  })
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    // Apply dark mode on mount
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const themes = [
    { id: 'morpho', name: 'Morpho', color: '#6B9F7F' },
    { id: 'homestead', name: 'Homestead', color: '#c89968' },
  ]

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId)
    localStorage.setItem('theme', themeId)
    onThemeChange?.(themeId)
    // Don't close menus when changing theme - only close on navigation
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    localStorage.setItem('darkMode', newMode.toString())
  }

  return (
    <>
      {/* Header with smooth black gradient - no hard stops */}
      <header className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/90 via-black/50 to-black/5 z-[1000] flex items-center justify-between px-4 backdrop-blur-lg">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦠</span>
          <span className="text-xl font-bold text-white drop-shadow-lg">
            Evolibrary
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden sm:flex items-center gap-4">
          <button 
            onClick={() => onNavigate?.('home')}
            className={`text-white drop-shadow-md hover:text-morpho-primary transition-colors font-medium ${
              currentPage === 'home' ? 'text-morpho-primary font-bold' : ''
            }`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate?.('books')}
            className={`text-white drop-shadow-md hover:text-morpho-primary transition-colors font-medium ${
              currentPage === 'books' ? 'text-morpho-primary font-bold' : ''
            }`}
          >
            Books
          </button>
          
          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="px-4 py-2 rounded-lg border-2 border-white/30 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm font-semibold flex items-center gap-2 transition-all shadow-lg drop-shadow-md"
            >
              ⚙️ Settings
            </button>

            {settingsOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 min-w-[220px] z-[1001]">
                {/* Appearance Section */}
                <div className="px-2 py-2 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Appearance
                </div>
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="w-full px-3 py-3 text-left rounded-md flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
                    <span className="font-medium">Dark Mode</span>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-morpho-primary' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${darkMode ? 'translate-x-6 mt-0.5 ml-0.5' : 'translate-x-0.5 mt-0.5'}`} />
                  </div>
                </button>

                {/* Theme Selector - Dropdown */}
                <div className="px-3 py-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Color Theme
                  </label>
                  <select
                    value={currentTheme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-morpho-primary transition-colors"
                  >
                    {themes.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 relative z-[1002]"
          aria-label="Menu"
        >
          <span className={`w-6 h-0.5 bg-white drop-shadow-md block transition-all duration-300 ${
            mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
          }`} />
          <span className={`w-6 h-0.5 bg-white drop-shadow-md block transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-0' : ''
          }`} />
          <span className={`w-6 h-0.5 bg-white drop-shadow-md block transition-all duration-300 ${
            mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
          }`} />
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-24 left-0 right-0 bg-black/90 backdrop-blur-lg shadow-lg p-4 z-[999] sm:hidden">
          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => {
                onNavigate?.('home')
                setMobileMenuOpen(false)
              }}
              className={`text-white drop-shadow-md hover:text-morpho-primary px-3 py-2 transition-colors font-medium text-left ${
                currentPage === 'home' ? 'text-morpho-primary font-bold' : ''
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                onNavigate?.('books')
                setMobileMenuOpen(false)
              }}
              className={`text-white drop-shadow-md hover:text-morpho-primary px-3 py-2 transition-colors font-medium text-left ${
                currentPage === 'books' ? 'text-morpho-primary font-bold' : ''
              }`}
            >
              Books
            </button>
            
            {/* Mobile Appearance Section */}
            <div className="border-t border-white/20 pt-3 mt-2">
              <div className="px-3 py-2 font-semibold text-xs text-white/70 uppercase tracking-wider">
                Appearance
              </div>
              
              {/* Dark Mode Toggle Mobile */}
              <button
                onClick={toggleDarkMode}
                className="w-full px-3 py-3 text-left rounded-md flex items-center justify-between hover:bg-white/10 text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{darkMode ? '🌙' : '☀️'}</span>
                  <span className="font-medium">Dark Mode</span>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-morpho-primary' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${darkMode ? 'translate-x-6 mt-0.5 ml-0.5' : 'translate-x-0.5 mt-0.5'}`} />
                </div>
              </button>

              {/* Theme Selector Mobile - Dropdown */}
              <div className="px-3 py-2">
                <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">
                  Color Theme
                </label>
                <select
                  value={currentTheme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/20 border border-white/30 text-white font-medium focus:outline-none focus:ring-2 focus:ring-morpho-primary transition-colors backdrop-blur-sm"
                >
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id} className="bg-gray-900 text-white">
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Backdrop */}
      {(mobileMenuOpen || settingsOpen) && (
        <div
          onClick={() => {
            setMobileMenuOpen(false)
            setSettingsOpen(false)
          }}
          className="fixed inset-0 z-[998] bg-black/10"
        />
      )}
    </>
  )
}