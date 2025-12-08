import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { BooksPage } from './pages/BooksPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'books' | 'settings'>('home')
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'morpho'
  })
  const [settingsSection, setSettingsSection] = useState<string>('libraries')

  const handleNavigate = (page: 'home' | 'books' | 'settings') => {
    console.log('[App] Navigating to:', page)
    setCurrentPage(page)
  }

  const handleNavigateToLogs = () => {
    console.log('[App] Navigating to logs section in settings')
    setSettingsSection('logging')
    setCurrentPage('settings')
  }

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
  }

  return (
    <>
      {currentPage === 'home' && (
        <HomePage 
          onNavigate={handleNavigate}
          onNavigateToLogs={handleNavigateToLogs}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}
      
      {currentPage === 'books' && (
        <BooksPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={handleNavigateToLogs}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage 
          onNavigate={handleNavigate}
          onNavigateToLogs={handleNavigateToLogs}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          initialSection={settingsSection}
        />
      )}
    </>
  )
}