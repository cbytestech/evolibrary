// File: frontend/src/components/Header.tsx (Enhanced with Progress Bars)

import { useState, useEffect } from 'react'
import { getMorphoStage, type MorphoEvolution, MORPHO_STAGES } from '../data/morphoEvolution'

interface HeaderProps {
  onNavigate?: (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => void
  currentPage?: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements'
  onThemeChange?: (theme: string) => void
  currentTheme?: string
}

export function Header({ onNavigate, currentPage = 'home', onThemeChange, currentTheme = 'morpho' }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [morphoStage, setMorphoStage] = useState<MorphoEvolution | null>(null)
  const [totalBooks, setTotalBooks] = useState(0)
  const [showMorphoTooltip, setShowMorphoTooltip] = useState(false)

  useEffect(() => {
    // Check system preference and localStorage
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
    
    // Load Morpho stage based on library stats
    fetchMorphoStage()
  }, [])

  const fetchMorphoStage = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8001/api/books/stats`)
      if (response.ok) {
        const stats = await response.json()
        const books = stats.total_books || 0
        setTotalBooks(books)
        const stage = getMorphoStage(books)
        setMorphoStage(stage)
      }
    } catch (error) {
      console.error('Failed to fetch Morpho stage:', error)
      // Default to grub
      setMorphoStage(getMorphoStage(0))
    }
  }

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

  const handleNavigation = (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => {
    setShowMobileMenu(false)
    if (onNavigate) {
      onNavigate(page)
    }
  }

  // Calculate progress to next stage
  const getProgressInfo = () => {
    if (!morphoStage) return null

    const currentStageIndex = MORPHO_STAGES.findIndex(s => s.stage === morphoStage.stage)
    const nextStage = MORPHO_STAGES[currentStageIndex + 1]

    if (!nextStage) {
      // Already at max stage (butterfly)
      return {
        percentage: 100,
        remaining: 0,
        nextStageName: 'Max Level!',
        nextRequirement: 100
      }
    }

    let nextRequirement = 50 // cocoon
    if (nextStage.stage === 'butterfly') nextRequirement = 100

    const percentage = Math.min(100, (totalBooks / nextRequirement) * 100)
    const remaining = Math.max(0, nextRequirement - totalBooks)

    return {
      percentage,
      remaining,
      nextStageName: nextStage.name,
      nextStageEmoji: nextStage.emoji,
      nextRequirement
    }
  }

  const progressInfo = getProgressInfo()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient background with backdrop blur - fades down */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/70 to-transparent dark:from-black/98 dark:via-black/80 dark:to-transparent backdrop-blur-lg"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with Evolving Morpho + Progress */}
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-3 group relative"
            onMouseEnter={() => setShowMorphoTooltip(true)}
            onMouseLeave={() => setShowMorphoTooltip(false)}
          >
            <div className="relative">
              <div className="text-3xl transition-transform group-hover:scale-110 group-hover:rotate-12">
                {morphoStage?.emoji || '🐛'}
              </div>
              
              {/* Enhanced Morpho Tooltip with Progress */}
              {showMorphoTooltip && morphoStage && progressInfo && (
                <div className="absolute left-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 z-50 animate-fadeIn">
                  
                  {/* Current Stage */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{morphoStage.emoji}</div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {morphoStage.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {morphoStage.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  {morphoStage.stage !== 'butterfly' ? (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Next Evolution: {progressInfo.nextStageEmoji} {progressInfo.nextStageName}
                          </span>
                          <span className="text-xs font-bold text-morpho-primary">
                            {Math.floor(progressInfo.percentage)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progressInfo.percentage}%` }}
                          />
                        </div>

                        {/* Books Count */}
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{totalBooks} books</span>
                          <span className="font-semibold text-morpho-primary">
                            {progressInfo.remaining} more to evolve!
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 text-center">
                      <p className="text-sm font-bold text-morpho-primary">
                        ✨ Maximum Evolution Reached! ✨
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        You've mastered your library with {totalBooks} books!
                      </p>
                    </div>
                  )}

                  {/* Quick Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNavigation('achievements')
                    }}
                    className="w-full mt-3 px-3 py-2 bg-morpho-primary hover:bg-morpho-dark text-white text-xs font-semibold rounded transition-colors"
                  >
                    View All Achievements 🏆
                  </button>
                </div>
              )}
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
              onClick={() => handleNavigation('search')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'search'
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🔍 Search
            </button>

            <button
              onClick={() => handleNavigation('activity')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'activity'
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              📊 Activity
            </button>

            <button
              onClick={() => handleNavigation('achievements')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 'achievements'
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🏆 Achievements
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
                onClick={() => handleNavigation('search')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentPage === 'search'
                    ? 'bg-morpho-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🔍 Search
              </button>

              <button
                onClick={() => handleNavigation('activity')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentPage === 'activity'
                    ? 'bg-morpho-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                📊 Activity
              </button>

              <button
                onClick={() => handleNavigation('achievements')}
                className={`px-4 py-3 rounded-lg font-semibold text-left transition-all ${
                  currentPage === 'achievements'
                    ? 'bg-morpho-primary text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                🏆 Achievements
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
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}