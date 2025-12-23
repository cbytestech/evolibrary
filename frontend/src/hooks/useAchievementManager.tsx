// File: frontend/src/hooks/useAchievementManager.tsx

import { useState, useEffect, useCallback } from 'react'
import { ACHIEVEMENTS, checkAchievements, type Achievement, type UserProgress } from '../data/achievements'
import { getMorphoStage, MORPHO_STAGES, type MorphoEvolution } from '../data/morphoEvolution'

interface AchievementNotification {
  achievement: Achievement
  id: string
}

interface EvolutionNotification {
  previousStage: MorphoEvolution
  newStage: MorphoEvolution
}

export function useAchievementManager() {
  const [pendingNotifications, setPendingNotifications] = useState<AchievementNotification[]>([])
  const [pendingEvolution, setPendingEvolution] = useState<EvolutionNotification | null>(null)
  const [lastCheckedBooks, setLastCheckedBooks] = useState(0)
  const [lastCheckedStage, setLastCheckedStage] = useState<string>('grub')

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem('evolibrary_last_book_count')
    if (saved) setLastCheckedBooks(parseInt(saved))
    
    const savedStage = localStorage.getItem('evolibrary_last_morpho_stage')
    if (savedStage) setLastCheckedStage(savedStage)
  }, [])

  // Check for new achievements and evolution
  const checkProgress = useCallback(async () => {
    try {
      // Fetch current stats
      const response = await fetch(`http://${window.location.hostname}:8001/api/books/stats`)
      if (!response.ok) return

      const stats = await response.json()
      
      // Load achievement data
      const savedAchievements = localStorage.getItem('evolibrary_achievements')
      const unlockedIds: string[] = savedAchievements ? JSON.parse(savedAchievements) : []
      
      const userProgress: UserProgress = {
        total_books: stats.total_books || 0,
        total_searches: parseInt(localStorage.getItem('evolibrary_search_count') || '0'),
        total_downloads: parseInt(localStorage.getItem('evolibrary_download_count') || '0'),
        monitored_books: stats.monitored_books || 0,
        genres_collected: 0,
        downloads_last_hour: 0,
        unlocked_achievements: unlockedIds
      }

      // Check for new achievements
      const newAchievements = checkAchievements(userProgress)
      
      if (newAchievements.length > 0) {
        // Save newly unlocked achievements
        const updatedUnlocked = [...unlockedIds, ...newAchievements.map(a => a.id)]
        localStorage.setItem('evolibrary_achievements', JSON.stringify(updatedUnlocked))
        
        // Queue notifications
        const notifications = newAchievements.map(achievement => ({
          achievement,
          id: `${achievement.id}-${Date.now()}`
        }))
        setPendingNotifications(prev => [...prev, ...notifications])
      }

      // Check for evolution
      const currentStage = getMorphoStage(userProgress.total_books)
      if (currentStage.stage !== lastCheckedStage) {
        // Evolution detected!
        const previousStageIndex = MORPHO_STAGES.findIndex(s => s.stage === lastCheckedStage)
        const previousStage = MORPHO_STAGES[previousStageIndex] || MORPHO_STAGES[0]
        
        setPendingEvolution({
          previousStage,
          newStage: currentStage
        })
        
        // Save new stage
        localStorage.setItem('evolibrary_last_morpho_stage', currentStage.stage)
        setLastCheckedStage(currentStage.stage)
      }

      // Save checked book count
      localStorage.setItem('evolibrary_last_book_count', String(userProgress.total_books))
      setLastCheckedBooks(userProgress.total_books)

    } catch (error) {
      console.error('Failed to check achievement progress:', error)
    }
  }, [lastCheckedBooks, lastCheckedStage])

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setPendingNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Dismiss evolution modal
  const dismissEvolution = useCallback(() => {
    setPendingEvolution(null)
  }, [])

  // Track search
  const trackSearch = useCallback(() => {
    const count = parseInt(localStorage.getItem('evolibrary_search_count') || '0')
    localStorage.setItem('evolibrary_search_count', String(count + 1))
    checkProgress()
  }, [checkProgress])

  // Track download
  const trackDownload = useCallback(() => {
    const count = parseInt(localStorage.getItem('evolibrary_download_count') || '0')
    localStorage.setItem('evolibrary_download_count', String(count + 1))
    checkProgress()
  }, [checkProgress])

  return {
    pendingNotifications,
    pendingEvolution,
    dismissNotification,
    dismissEvolution,
    checkProgress,
    trackSearch,
    trackDownload
  }
}