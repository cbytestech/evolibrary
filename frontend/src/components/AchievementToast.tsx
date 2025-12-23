// File: frontend/src/components/AchievementToast.tsx

import { useEffect, useState } from 'react'
import { type Achievement } from '../data/achievements'

interface AchievementToastProps {
  achievement: Achievement
  onClose: () => void
  duration?: number
}

export function AchievementToast({ achievement, onClose, duration = 5000 }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10)

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const hasUnlockedTheme = achievement.unlocks_theme

  return (
    <div className={`fixed top-24 right-4 z-[100] transition-all duration-300 ${
      isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random()}s`
            }}
          >
            {['🎉', '✨', '⭐', '🌟'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* Toast Card */}
      <div className="bg-gradient-to-br from-morpho-primary to-blue-600 text-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-md border-2 border-white/20 backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl animate-bounce">🏆</div>
          <div>
            <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
            <p className="text-xs text-white/80">New milestone reached</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Achievement Content */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="text-5xl animate-pulse">{achievement.icon}</div>
            <div>
              <h4 className="font-bold text-xl mb-1">{achievement.name}</h4>
              <p className="text-sm text-white/90">{achievement.description}</p>
            </div>
          </div>
        </div>

        {/* Theme Unlock Banner */}
        {hasUnlockedTheme && (
          <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-lg p-3 mb-3 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="text-sm font-semibold">New Theme Unlocked!</p>
                <p className="text-xs text-white/80">Check Settings → Themes</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
          >
            Continue
          </button>
          <button
            onClick={() => {
              // Navigate to achievements page
              window.dispatchEvent(new CustomEvent('navigate-to-achievements'))
              handleClose()
            }}
            className="flex-1 px-4 py-2 bg-white hover:bg-white/90 text-morpho-primary rounded-lg text-sm font-semibold transition-colors"
          >
            View All 🏆
          </button>
        </div>
      </div>
    </div>
  )
}

// Add these animations to your global CSS (globals.css or index.css):
/*
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(400px) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti 3s ease-in-out forwards;
}
*/