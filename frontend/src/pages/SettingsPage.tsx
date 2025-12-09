import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { SettingsLayout } from '../components/SettingsLayout'
import { LibrariesSettings } from '../components/settings/LibrariesSettings'
import { UISettings } from '../components/settings/UISettings'
import { LoggingSettings } from '../components/settings/LoggingSettings'
import { HealthSettings } from '../components/settings/HealthSettings'
import { GeneralSettings } from '../components/settings/GeneralSettings'
import { AppsSettings } from '../components/settings/AppsSettings'
import { IndexersSettings } from '../components/settings/IndexersSettings'
import { ComingSoonSettings } from '../components/settings/ComingSoonSettings'

interface SettingsPageProps {
  onNavigate?: (page: 'home' | 'books' | 'settings') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
  initialSection?: string
}

export function SettingsPage({ 
  onNavigate,
  onNavigateToLogs,
  currentTheme = 'morpho', 
  onThemeChange,
  initialSection = 'libraries'
}: SettingsPageProps) {
  const [currentSection, setCurrentSection] = useState(initialSection)

  // Update section when initialSection changes (when navigating to logs)
  useEffect(() => {
    console.log('[SettingsPage] initialSection changed to:', initialSection)
    setCurrentSection(initialSection)
  }, [initialSection])

  const getBackgroundClass = () => {
    if (currentTheme === 'homestead') {
      return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-amber-950'
    }
    return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'libraries':
        return <LibrariesSettings />
      case 'ui':
        return <UISettings currentTheme={currentTheme} onThemeChange={onThemeChange} />
      case 'apps':
        return <AppsSettings />
      case 'indexers':
        return <IndexersSettings />
      case 'logging':
        return <LoggingSettings />
      case 'health':
        return <HealthSettings />
      case 'general':
        return <GeneralSettings />
      case 'download-clients':
      case 'import-lists':
      case 'connect':
      case 'metadata':
        return <ComingSoonSettings sectionName={currentSection} />
      default:
        return <LibrariesSettings />
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onNavigate={onNavigate} 
        currentPage="settings" 
        onThemeChange={onThemeChange} 
      />
      
      <main className={`flex-1 ${getBackgroundClass()} pt-20 overflow-hidden`}>
        <SettingsLayout 
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        >
          {renderSection()}
        </SettingsLayout>
      </main>

      <Footer 
        onNavigate={onNavigate}
        onNavigateToLogs={onNavigateToLogs}
      />
    </div>
  )
}