import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking'
  app: string
  version: string
  morpho_says?: string
}

interface FooterProps {
  onNavigate?: (page: 'home' | 'books' | 'settings') => void
  onNavigateToLogs?: () => void
}

export function Footer({ onNavigate, onNavigateToLogs }: FooterProps) {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    app: 'Evolibrary',
    version: '0.1.0'
  })
  const [showDetails, setShowDetails] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(30)

  useEffect(() => {
    // Check health immediately with retry logic
    const initialCheck = async () => {
      let attempts = 0
      const maxAttempts = 5
      
      while (attempts < maxAttempts) {
        const success = await checkHealth()
        
        // If healthy, stop retrying
        if (success) {
          console.log('[Footer] Health check successful!')
          break
        }
        
        // Wait 2 seconds before retry
        attempts++
        if (attempts < maxAttempts) {
          console.log(`[Footer] Retry ${attempts}/${maxAttempts} in 2s...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }
    
    initialCheck()

    // Then check every 30 seconds
    const interval = setInterval(() => {
      checkHealth()
      setRetryCountdown(30)
    }, 30000)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setRetryCountdown(prev => prev > 0 ? prev - 1 : 30)
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
    }
  }, [])

  const checkHealth = async (): Promise<boolean> => {
    console.log('[Footer] Checking health at:', API_BASE_URL)
    setRetryCountdown(30)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      console.log('[Footer] Health check response:', response.status, response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[Footer] Health data:', data)
        setHealth({
          status: 'healthy',
          app: data.app,
          version: data.version,
          morpho_says: data.morpho_says
        })
        return true
      } else {
        console.warn('[Footer] Health check not OK:', response.status)
        setHealth(prev => ({ ...prev, status: 'unhealthy' }))
        return false
      }
    } catch (err) {
      console.error('[Footer] Health check failed:', err)
      setHealth(prev => ({ ...prev, status: 'unhealthy' }))
      return false
    }
  }

  const handleLogsClick = () => {
    console.log('[Footer] Logs button clicked')
    if (onNavigateToLogs) {
      // Use the direct logs handler if available
      onNavigateToLogs()
    } else if (onNavigate) {
      // Fallback to regular navigation
      onNavigate('settings')
    }
  }

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'bg-green-500'
      case 'unhealthy': return 'bg-red-500'
      case 'checking': return 'bg-yellow-500 animate-pulse'
    }
  }

  const getStatusText = () => {
    switch (health.status) {
      case 'healthy': return 'Online'
      case 'unhealthy': return 'Offline'
      case 'checking': return 'Checking...'
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 py-2">
        
        {/* Single Row Layout */}
        <div className="flex flex-wrap items-center justify-between text-xs gap-4">
          
          {/* Left: Health Info Cluster */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Indicator */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <span className="font-medium">{getStatusText()}</span>
            </button>
            
            {/* API URL */}
            <span className="text-gray-500">{API_BASE_URL}</span>
            
            {/* Version */}
            <span className="text-gray-500">v{health.version}</span>
            
            {/* Retry or Logs */}
            {health.status !== 'healthy' ? (
              <button
                onClick={checkHealth}
                className="px-2 py-1 bg-morpho-primary/80 hover:bg-morpho-primary text-white rounded font-semibold transition-colors"
              >
                🔄 {retryCountdown}s
              </button>
            ) : (
              <button
                onClick={handleLogsClick}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded font-semibold transition-colors cursor-pointer"
              >
                📋 Logs
              </button>
            )}
          </div>

          {/* Center: Powered By */}
          <div className="text-center">
            Powered by{' '}
            <a
              href="https://cookiebytestech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-morpho-light hover:text-morpho-primary transition-colors"
            >
              CookieBytes Technologies
            </a>
            {' '}🍪
          </div>

          {/* Right: Built with Claude */}
          <div className="flex items-center gap-2">
            <span>Built with</span>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-purple-500/20 hover:from-orange-500/30 hover:to-purple-500/30 rounded border border-orange-500/30 transition-all"
            >
              <span className="font-semibold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                Claude Sonnet 4.5
              </span>
            </a>
            <span className="text-gray-500">| Made in Alabama 🏈</span>
          </div>
        </div>

        {/* Expanded Details (Optional) */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-800 text-xs">
            <div className="flex items-center justify-between">
              <div className="text-morpho-light">
                {health.morpho_says || '🦠 Ready to evolve your reading!'}
              </div>
              {health.status !== 'healthy' && (
                <div className="text-orange-400">
                  Auto-retry in {retryCountdown}s | Backend may be crashed
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}