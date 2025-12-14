import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'library' | 'settings'>('home')
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('colorTheme') || 'morpho'
  })

  const handleNavigate = (page: 'home' | 'library' | 'settings') => {
    setCurrentPage(page)
  }

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
  }

  return (
    <>
      {currentPage === 'home' && (
        <HomePage 
          onNavigate={handleNavigate} 
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}
      
      {currentPage === 'library' && (
        <LibraryPage 
          onNavigate={handleNavigate} 
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage 
          onNavigate={handleNavigate} 
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}
    </>
  )
}