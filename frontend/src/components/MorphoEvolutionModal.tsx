// File: frontend/src/components/MorphoEvolutionModal.tsx

import { useEffect, useState } from 'react'
import { type MorphoEvolution } from '../data/morphoEvolution'

interface MorphoEvolutionModalProps {
  previousStage: MorphoEvolution
  newStage: MorphoEvolution
  onClose: () => void
}

export function MorphoEvolutionModal({ previousStage, newStage, onClose }: MorphoEvolutionModalProps) {
  const [phase, setPhase] = useState<'intro' | 'transforming' | 'reveal' | 'complete'>('intro')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Phase timeline
    const timeline = [
      { phase: 'intro', delay: 1000 },
      { phase: 'transforming', delay: 3000 },
      { phase: 'reveal', delay: 2000 },
      { phase: 'complete', delay: 0 }
    ]

    let currentDelay = 0
    timeline.forEach(({ phase: nextPhase, delay }) => {
      setTimeout(() => {
        setPhase(nextPhase as typeof phase)
      }, currentDelay)
      currentDelay += delay
    })

    // Progress bar animation during transformation
    if (phase === 'transforming') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [phase])

  const getBackgroundGradient = () => {
    if (newStage.stage === 'butterfly') {
      return 'from-emerald-500 via-blue-500 to-purple-500'
    } else if (newStage.stage === 'cocoon') {
      return 'from-amber-500 via-orange-500 to-amber-600'
    }
    return 'from-green-400 via-emerald-500 to-green-600'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] animate-fadeIn">
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            {['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* Main Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${getBackgroundGradient()} p-8 text-white text-center`}>
          <h2 className="text-4xl font-bold mb-2 animate-pulse">
            {phase === 'intro' && '🦋 Morpho is Evolving!'}
            {phase === 'transforming' && '✨ Transformation in Progress...'}
            {(phase === 'reveal' || phase === 'complete') && '🎉 Evolution Complete!'}
          </h2>
          <p className="text-white/90">
            {phase === 'intro' && 'Your library has reached a major milestone!'}
            {phase === 'transforming' && 'Watch the magic happen...'}
            {(phase === 'reveal' || phase === 'complete') && `Welcome to the ${newStage.name} stage!`}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* Intro Phase */}
          {phase === 'intro' && (
            <div className="text-center animate-fadeIn">
              <div className="text-8xl mb-6 animate-bounce">{previousStage.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {previousStage.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {previousStage.description}
              </p>
            </div>
          )}

          {/* Transforming Phase */}
          {phase === 'transforming' && (
            <div className="text-center animate-fadeIn">
              <div className="relative h-48 flex items-center justify-center mb-6">
                {/* Spinning transformation effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl animate-spin-slow opacity-50">{previousStage.emoji}</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl animate-pulse scale-150 opacity-30">{newStage.emoji}</div>
                </div>
                <div className="relative z-10 text-6xl animate-ping">{previousStage.emoji}</div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-blue-500 h-4 rounded-full transition-all duration-300 animate-pulse"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Evolving... {Math.floor(progress)}%
                </p>
              </div>
            </div>
          )}

          {/* Reveal Phase */}
          {(phase === 'reveal' || phase === 'complete') && (
            <div className="text-center animate-fadeIn">
              {/* Before & After Comparison */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center opacity-50">
                  <div className="text-5xl mb-2">{previousStage.emoji}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Before</p>
                </div>
                
                <div className="text-3xl">→</div>
                
                <div className="text-center">
                  <div className="text-8xl mb-2 animate-bounce">{newStage.emoji}</div>
                  <p className="text-sm font-bold text-morpho-primary">After</p>
                </div>
              </div>

              {/* New Stage Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-6">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {newStage.name}
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  {newStage.description}
                </p>
                
                {/* Milestone Stats */}
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-morpho-primary">
                      {newStage.stage === 'cocoon' ? '50+' : '100+'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Books Collected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-morpho-primary">🎉</div>
                    <div className="text-gray-600 dark:text-gray-400">Milestone Reached</div>
                  </div>
                </div>
              </div>

              {/* Next Goal Hint */}
              {newStage.stage !== 'butterfly' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Next Evolution:</strong> {newStage.unlockRequirement}
                  </p>
                </div>
              )}

              {/* Close Button */}
              {phase === 'complete' && (
                <button
                  onClick={onClose}
                  className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-morpho-primary to-blue-500 hover:from-morpho-dark hover:to-blue-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                >
                  Continue Your Journey! 🚀
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// Add these animations to your globals.css:
/*
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}
*/