// File: frontend/src/pages/AchievementsPage.tsx

import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { ACHIEVEMENTS, type Achievement, type UserProgress, checkAchievements } from '../data/achievements'
import { getThemeBackground } from '../utils/themes'

interface AchievementsPageProps {
  onNavigate?: (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export function AchievementsPage({
  onNavigate,
  onNavigateToLogs,
  currentTheme = 'morpho',
  onThemeChange
}: AchievementsPageProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'collection' | 'search' | 'download' | 'hidden' | 'evolution'>('all')

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      // Fetch stats from backend
      const response = await fetch(`http://${window.location.hostname}:8001/api/books/stats`)
      if (response.ok) {
        const stats = await response.json()
        
        // Load achievements from localStorage
        const saved = localStorage.getItem('evolibrary_achievements')
        const unlockedIds: string[] = saved ? JSON.parse(saved) : []
        
        const userProgress: UserProgress = {
          total_books: stats.total_books || 0,
          total_searches: parseInt(localStorage.getItem('evolibrary_search_count') || '0'),
          total_downloads: parseInt(localStorage.getItem('evolibrary_download_count') || '0'),
          monitored_books: stats.monitored_books || 0,
          genres_collected: 0, // TODO: Calculate from books data
          downloads_last_hour: 0, // TODO: Track from download timestamps
          unlocked_achievements: unlockedIds
        }

        setProgress(userProgress)
        setUnlockedAchievements(new Set(unlockedIds))

        // Check for newly unlocked achievements
        const newlyUnlocked = checkAchievements(userProgress)
        if (newlyUnlocked.length > 0) {
          const updatedUnlocked = [...unlockedIds, ...newlyUnlocked.map((a: Achievement) => a.id)]
          localStorage.setItem('evolibrary_achievements', JSON.stringify(updatedUnlocked))
          setUnlockedAchievements(new Set(updatedUnlocked))
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = ACHIEVEMENTS.filter((achievement: Achievement) => {
    if (selectedCategory === 'all') return true
    return achievement.category === selectedCategory
  })

  const getProgressPercentage = (achievement: Achievement): number => {
    if (!progress) return 0
    
    let current = 0
    if (achievement.category === 'collection') current = progress.total_books
    if (achievement.category === 'search') current = progress.total_searches
    if (achievement.category === 'download') current = progress.total_downloads
    if (achievement.category === 'evolution') current = progress.total_books
    if (achievement.id === 'automation_wizard') current = progress.monitored_books
    if (achievement.id === 'genre_master') current = progress.genres_collected
    if (achievement.id === 'speed_demon') current = progress.downloads_last_hour
    
    return Math.min(100, (current / achievement.requirement) * 100)
  }

  const totalAchievements = ACHIEVEMENTS.length
  const totalUnlocked = unlockedAchievements.size
  const completionPercentage = Math.round((totalUnlocked / totalAchievements) * 100)

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="home" onThemeChange={onThemeChange} />
      
      <main className={`flex-1 ${getThemeBackground(currentTheme)} pt-24`}>
        <div className="container mx-auto px-4 py-12">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Achievements
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              Track your library management milestones
            </p>
            
            {/* Overall Progress */}
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-morpho-primary">{totalUnlocked}/{totalAchievements}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Achievements Unlocked</div>
                </div>
                <div className="text-5xl">🦋</div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                  className="bg-morpho-primary rounded-full h-4 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-400 mt-2">
                {completionPercentage}% Complete
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {(['all', 'evolution', 'collection', 'search', 'download', 'hidden'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-morpho-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-400">Loading achievements...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {filteredAchievements.map((achievement: Achievement) => {
                const isUnlocked = unlockedAchievements.has(achievement.id)
                const isHidden = achievement.hidden && !isUnlocked
                const progressPercent = getProgressPercentage(achievement)

                return (
                  <div
                    key={achievement.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all ${
                      isUnlocked ? 'ring-2 ring-morpho-primary' : 'opacity-60'
                    }`}
                  >
                    {/* Icon */}
                    <div className="text-5xl mb-4 text-center">
                      {isHidden ? '🔒' : achievement.icon}
                    </div>

                    {/* Name & Description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                      {isHidden ? '???' : achievement.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                      {isHidden ? 'Hidden achievement - unlock to reveal!' : achievement.description}
                    </p>

                    {/* Progress Bar */}
                    {!isUnlocked && !isHidden && (
                      <div className="mb-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-morpho-primary rounded-full h-2 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                          {Math.floor((progressPercent / 100) * achievement.requirement)}/{achievement.requirement}
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className={`text-center text-sm font-semibold ${
                      isUnlocked 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isUnlocked ? '✅ Unlocked!' : isHidden ? '🔒 Locked' : '⏳ In Progress'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>

      <Footer onNavigate={onNavigate} onNavigateToLogs={onNavigateToLogs} />
    </div>
  )
}