import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config/api'

export function HealthSettings() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth()
  }, [])

  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`)
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
      }
    } catch (err) {
      console.error('Failed to fetch health:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          🏥 Health
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          System diagnostics and health checks
        </p>
      </div>

      {/* API Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          API Status
        </h2>
        
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        ) : health ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-900 dark:text-white">Online</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>App: {health.app}</div>
              <div>Version: {health.version}</div>
              <div>Message: {health.morpho_says}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-medium">Offline</span>
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          System Information
        </h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Frontend URL:</span>
            <span className="font-mono text-gray-900 dark:text-white">{window.location.origin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Backend URL:</span>
            <span className="font-mono text-gray-900 dark:text-white">{API_BASE_URL}</span>
          </div>
        </div>
      </div>
    </div>
  )
}