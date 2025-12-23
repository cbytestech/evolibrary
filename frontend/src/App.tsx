// File: frontend/src/App.tsx (Enhanced with Achievement System)

import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { SettingsPage } from './pages/SettingsPage'
import { SearchPage } from './pages/SearchPage'
import { ActivityPage } from './pages/ActivityPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { AchievementToast } from './components/AchievementToast'
import { MorphoEvolutionModal } from './components/MorphoEvolutionModal'
import { useAchievementManager } from './hooks/useAchievementManager'
import { getRandomAlienQuote } from './utils/alienQuotes' // import { LogsModal } from './components/LogsModal'  // Uncomment if you have LogsModal

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements'>('home')
  const [showLogs, setShowLogs] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'morpho'
  })
  //Alien Quote
  const [alienQuote] = useState(getRandomAlienQuote())
  // Achievement system
  const {
    pendingNotifications,
    pendingEvolution,
    dismissNotification,
    dismissEvolution,
    checkProgress,
    trackSearch,
    trackDownload
  } = useAchievementManager()

  const handleNavigate = (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => {
    setCurrentPage(page)
    
    // Check progress when navigating to key pages
    if (page === 'library' || page === 'home' || page === 'achievements') {
      setTimeout(() => checkProgress(), 500)
    }
  }

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
  }

  // Listen for custom navigation event from achievement toast
  useState(() => {
    const handleNavigateEvent = () => {
      setCurrentPage('achievements')
    }
    window.addEventListener('navigate-to-achievements', handleNavigateEvent)
    return () => window.removeEventListener('navigate-to-achievements', handleNavigateEvent)
  })

  return (
    <>
      {currentPage === 'home' && (
        <HomePage 
          onNavigate={handleNavigate}
          onNavigateToLogs={() => setShowLogs(true)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}
      
      {currentPage === 'library' && (
        <LibraryPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={() => setShowLogs(true)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {currentPage === 'search' && (
        <SearchPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={() => setShowLogs(true)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {currentPage === 'activity' && (
        <ActivityPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={() => setShowLogs(true)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {currentPage === 'achievements' && (
        <AchievementsPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={() => setShowLogs(true)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={() => setShowLogs(true)}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {/* Achievement Notification Toasts */}
      {pendingNotifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ top: `${6 + index * 8}rem` }}
          className="fixed right-4 z-[100]"
        >
          <AchievementToast
            achievement={notification.achievement}
            onClose={() => dismissNotification(notification.id)}
          />
        </div>
      ))}

      {/* Morpho Evolution Modal */}
      {pendingEvolution && (
        <MorphoEvolutionModal
          previousStage={pendingEvolution.previousStage}
          newStage={pendingEvolution.newStage}
          onClose={dismissEvolution}
        />
      )}

      {/* Uncomment when you have LogsModal component
      {showLogs && (
        <LogsModal onClose={() => setShowLogs(false)} />
      )}
      */}
    </>
  )
}