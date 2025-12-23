// File: frontend/src/pages/HomePage.tsx - WITH ALIEN LOADING SCREEN

import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { getMorphoStage } from '../data/morphoEvolution'
import { getRandomAlienQuote } from '../utils/alienQuotes'
import { 
  getThemeBackground, 
  getThemeStatCard, 
  getThemeRecommendationBox, 
  getThemeQuickActionsPanel, 
  getThemeInsightsPanel, 
  getThemeGettingStarted,
  getThemeTextColor,
  getThemeHoverBg
} from '../utils/themes'

interface HomePageProps {
  onNavigate?: (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export function HomePage({ onNavigate, onNavigateToLogs, currentTheme = 'morpho', onThemeChange }: HomePageProps) {
  const [stats, setStats] = useState<any>(null)
  const [morphoStage, setMorphoStage] = useState<any>(null)
  const [backendReady, setBackendReady] = useState(false)
  const [alienQuote] = useState(getRandomAlienQuote())

  useEffect(() => {
    checkBackendAndFetchStats()
    
    // Poll for backend every 2 seconds if not ready
    const interval = setInterval(() => {
      if (!backendReady) {
        checkBackendAndFetchStats()
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [backendReady])

  const checkBackendAndFetchStats = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8001/api/health`)
      if (response.ok) {
        setBackendReady(true)
        fetchStats()
      }
    } catch (error) {
      setBackendReady(false)
      console.log('Backend not ready yet...')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://${window.location.hostname}:8001/api/books/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setMorphoStage(getMorphoStage(data.total_books || 0))
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // Show loading screen if backend not ready
  if (!backendReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-space-darker via-morpho-dark to-space-darker">
        <div className="text-center">
          <div className="text-8xl mb-8 animate-bounce">🛸</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            EvoLibrary
          </h1>
          <p className="text-morpho-lighter text-xl mb-2 italic px-4">
            "{alienQuote.text}"
          </p>
          <p className="text-morpho-lighter/60 text-sm mb-6">
            — {alienQuote.source}
          </p>
          <p className="text-morpho-lighter">
            Establishing contact with mothership...
          </p>
          <div className="mt-8 flex gap-2 justify-center">
            <div className="w-3 h-3 bg-morpho-primary rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-morpho-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-morpho-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="home" onThemeChange={onThemeChange} />
      
      <main className={`flex-1 ${getThemeBackground(currentTheme)} pt-24`}>
        <div className="container mx-auto px-4 py-12">
          
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4 animate-bounce">{morphoStage?.emoji || '🛸'}</div>
            <h1 className={`text-4xl font-bold ${getThemeTextColor(currentTheme, 'primary')} mb-2`}>
              Welcome to Evolibrary
            </h1>
            <p className={`text-lg ${getThemeTextColor(currentTheme, 'secondary')}`}>
              {morphoStage?.description || 'Your self-hosted library manager'}
            </p>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className={`${getThemeStatCard(currentTheme)} p-6 text-center transition-all hover:scale-105`}>
                <div className="text-4xl font-bold text-morpho-primary mb-2">
                  {stats.total_books}
                </div>
                <div className={`text-sm ${getThemeTextColor(currentTheme, 'secondary')}`}>
                  Total Books
                </div>
              </div>

              <div className={`${getThemeStatCard(currentTheme)} p-6 text-center transition-all hover:scale-105`}>
                <div className="text-4xl font-bold text-morpho-primary mb-2">
                  {stats.monitored_books}
                </div>
                <div className={`text-sm ${getThemeTextColor(currentTheme, 'secondary')}`}>
                  Monitored
                </div>
              </div>

              <div className={`${getThemeStatCard(currentTheme)} p-6 text-center transition-all hover:scale-105`}>
                <div className="text-4xl font-bold text-morpho-primary mb-2">
                  {stats.recent_additions}
                </div>
                <div className={`text-sm ${getThemeTextColor(currentTheme, 'secondary')}`}>
                  Added This Week
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* Quick Actions */}
            <div className={`${getThemeQuickActionsPanel(currentTheme)} p-6`}>
              <h2 className={`text-2xl font-bold ${getThemeTextColor(currentTheme, 'primary')} mb-6`}>
                ⚡ Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate?.('search')}
                  className={`w-full text-left px-4 py-3 rounded-lg ${getThemeHoverBg(currentTheme)} transition-colors ${getThemeTextColor(currentTheme, 'primary')}`}
                >
                  🔍 Search & Download
                </button>
                <button
                  onClick={() => onNavigate?.('library')}
                  className={`w-full text-left px-4 py-3 rounded-lg ${getThemeHoverBg(currentTheme)} transition-colors ${getThemeTextColor(currentTheme, 'primary')}`}
                >
                  📚 Browse Library
                </button>
                <button
                  onClick={() => onNavigate?.('activity')}
                  className={`w-full text-left px-4 py-3 rounded-lg ${getThemeHoverBg(currentTheme)} transition-colors ${getThemeTextColor(currentTheme, 'primary')}`}
                >
                  📊 View Activity
                </button>
                <button
                  onClick={() => onNavigate?.('achievements')}
                  className={`w-full text-left px-4 py-3 rounded-lg ${getThemeHoverBg(currentTheme)} transition-colors ${getThemeTextColor(currentTheme, 'primary')}`}
                >
                  🏆 Achievements
                </button>
              </div>
            </div>

            {/* Insights */}
            <div className={`${getThemeInsightsPanel(currentTheme)} p-6`}>
              <h2 className={`text-2xl font-bold ${getThemeTextColor(currentTheme, 'primary')} mb-6`}>
                📈 Insights
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${getThemeHoverBg(currentTheme)}`}>
                  <div className={`text-sm ${getThemeTextColor(currentTheme, 'secondary')} mb-1`}>Library Growth</div>
                  <div className={`text-2xl font-bold ${getThemeTextColor(currentTheme, 'primary')}`}>
                    {stats?.recent_additions || 0} books this week
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${getThemeHoverBg(currentTheme)}`}>
                  <div className={`text-sm ${getThemeTextColor(currentTheme, 'secondary')} mb-1`}>Morpho Stage</div>
                  <div className={`text-2xl font-bold ${getThemeTextColor(currentTheme, 'primary')}`}>
                    {morphoStage?.name || 'Egg'}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${getThemeHoverBg(currentTheme)}`}>
                  <div className={`text-sm ${getThemeTextColor(currentTheme, 'secondary')} mb-1`}>Next Evolution</div>
                  <div className={`text-lg ${getThemeTextColor(currentTheme, 'primary')}`}>
                    {morphoStage?.next_milestone ? 
                      `${stats?.total_books || 0} / ${morphoStage.next_milestone} books` : 
                      'Max level!'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started */}
          {!stats || stats.total_books === 0 ? (
            <div className={`${getThemeGettingStarted(currentTheme)} p-8 max-w-4xl mx-auto mt-12`}>
              <h2 className={`text-2xl font-bold ${getThemeTextColor(currentTheme, 'primary')} mb-4`}>
                🚀 Getting Started
              </h2>
              <div className="space-y-3">
                <p className={getThemeTextColor(currentTheme, 'primary')}>
                  1. Go to <strong>Settings</strong> and configure Prowlarr/Jackett
                </p>
                <p className={getThemeTextColor(currentTheme, 'primary')}>
                  2. Visit <strong>Search</strong> to find and download books
                </p>
                <p className={getThemeTextColor(currentTheme, 'primary')}>
                  3. Watch your library grow and Morpho evolve! 🦋
                </p>
              </div>
            </div>
          ) : null}

        </div>
      </main>

      <Footer onNavigate={onNavigate} onNavigateToLogs={onNavigateToLogs} />
    </div>
  )
}