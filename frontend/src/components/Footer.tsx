import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking'
  app: string
  version: string
  morpho_says?: string
  local_ip?: string
  public_ip?: string
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
  const [publicIp, setPublicIp] = useState<string>('')
  const [localIp, setLocalIp] = useState<string>('')
  const [fetchingIp, setFetchingIp] = useState(false)

  const fetchPublicIp = async () => {
    setFetchingIp(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/system/ip`)
      const data = await response.json()
      if (data.public_ip) {
        setPublicIp(data.public_ip)
      }
    } catch (error) {
      console.error('Failed to fetch public IP:', error)
    } finally {
      setFetchingIp(false)
    }
  }

  useEffect(() => {
    // Get local IP from current URL
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setLocalIp(hostname)
    }

    // Initial health check with retry logic
    const initialCheck = async () => {
      let attempts = 0
      const maxAttempts = 5
      
      while (attempts < maxAttempts) {
        const success = await checkHealth()
        
        // If healthy, stop retrying and fetch IP
        if (success) {
          console.log('[Footer] Health check successful!')
          fetchPublicIp()
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

    // Check health every 30 seconds
    const healthInterval = setInterval(checkHealth, 30000)
    
    // Refresh public IP every 5 minutes (in case VPN reconnects)
    const ipInterval = setInterval(fetchPublicIp, 300000)
    
    return () => {
      clearInterval(healthInterval)
      clearInterval(ipInterval)
    }
  }, [])

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`)
      if (response.ok) {
        const data = await response.json()
        setHealth({
          status: 'healthy',
          app: data.app || 'Evolibrary',
          version: data.version || '0.1.0',
          morpho_says: data.morpho_says
        })
        return true
      } else {
        setHealth(prev => ({ ...prev, status: 'unhealthy' }))
        return false
      }
    } catch (error) {
      setHealth(prev => ({ ...prev, status: 'unhealthy' }))
      return false
    }
  }

  const handleLogsClick = () => {
    console.log('[Footer] Logs button clicked')
    if (onNavigateToLogs) {
      console.log('[Footer] Calling onNavigateToLogs')
      onNavigateToLogs()
    } else {
      console.log('[Footer] No onNavigateToLogs handler!')
    }
  }

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'bg-green-500'
      case 'unhealthy': return 'bg-red-500'
      case 'checking': return 'bg-yellow-500 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (health.status) {
      case 'healthy': return 'Operational'
      case 'unhealthy': return 'Offline'
      case 'checking': return 'Checking...'
      default: return 'Unknown'
    }
  }

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Status and IPs */}
        <div className="flex items-center gap-6">
          {/* Status Indicator */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
            title="Click for details"
          >
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">
              {getStatusText()}
            </span>
          </button>

          {/* Retry Button (when unhealthy) */}
          {health.status === 'unhealthy' && (
            <button
              onClick={() => checkHealth()}
              className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
            >
              🔄 Retry
            </button>
          )}

          {/* IP Addresses */}
          {(localIp || publicIp) && (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {localIp && (
                <span className="font-mono">
                  🏠 {localIp}
                </span>
              )}
              {localIp && publicIp && <span>|</span>}
              {publicIp ? (
                <span className="font-mono">
                  🌐 {publicIp}
                </span>
              ) : (
                <span className="text-gray-400 dark:text-gray-600 animate-pulse">
                  Loading IP...
                </span>
              )}
              {/* Refresh IP Button */}
              <button
                onClick={fetchPublicIp}
                disabled={fetchingIp}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                title="Refresh public IP"
              >
                {fetchingIp ? '⏳' : '🔄'}
              </button>
            </div>
          )}
        </div>

        {/* Center: App Info */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">{health.app}</span>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span>v{health.version}</span>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Logs Button */}
          <button
            onClick={handleLogsClick}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            title="View logs"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Logs</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onNavigate?.('settings')}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            title="Settings"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {health.status === 'healthy' ? '✅ All systems operational' : '❌ System offline'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Version:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {health.version}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">API:</span>
              <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                {API_BASE_URL}
              </span>
            </div>
          </div>
          {health.morpho_says && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
              💬 {health.morpho_says}
            </div>
          )}
        </div>
      )}
    </footer>
  )
}