import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config/api'
import { ConfirmModal } from '../ConfirmModal'

interface App {
  id: number
  name: string
  app_type: 'prowlarr' | 'jackett' | 'flaresolverr' | 'kavita'
  base_url: string
  api_key?: string
  enabled: boolean
  last_test_status?: 'success' | 'failed' | 'pending'
  last_test_message?: string
  last_test_at?: string
  created_at: string
}

interface AppTemplate {
  type: 'prowlarr' | 'jackett' | 'flaresolverr' | 'kavita'
  name: string
  icon: string
  description: string
  defaultPort: number
  requiresApiKey: boolean
  requiresPassword: boolean
  helpText: string
}

const APP_TEMPLATES: AppTemplate[] = [
  {
    type: 'prowlarr',
    name: 'Prowlarr',
    icon: '🦉',  // Prowlarr's owl mascot
    description: 'Indexer manager and aggregator',
    defaultPort: 9696,
    requiresApiKey: true,
    requiresPassword: false,
    helpText: 'Primary indexer source. Get API key from Settings → General → Security'
  },
  {
    type: 'jackett',
    name: 'Jackett',
    icon: '🧥',  // Jacket = Jackett
    description: 'Torrent/NZB indexer proxy',
    defaultPort: 9117,
    requiresApiKey: true,
    requiresPassword: true,
    helpText: 'Secondary indexer source with FlareSolverr support. API key found on dashboard'
  },
  {
    type: 'flaresolverr',
    name: 'FlareSolverr',
    icon: '🔥',  // Flare = Fire
    description: 'Cloudflare bypass for Jackett',
    defaultPort: 8191,
    requiresApiKey: false,
    requiresPassword: false,
    helpText: 'Helps Jackett bypass Cloudflare protection. No API key needed'
  },
  {
    type: 'kavita',
    name: 'Kavita',
    icon: '📚',  // Kavita is a reading server
    description: 'Reading server & wishlist sync',
    defaultPort: 5000,
    requiresApiKey: true,
    requiresPassword: false,
    helpText: 'Monitor wishlists and sync reading progress. Use JWT token from User → Settings'
  }
]

export function AppsSettings() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [testing, setTesting] = useState<number | null>(null)
  const [testingInModal, setTestingInModal] = useState(false)
  const [testResult, setTestResult] = useState<{status: string, message: string} | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{id: number, name: string} | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    base_url: '',
    api_key: '',
    password: ''
  })

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps`)
      const data = await response.json()
      setApps(data.apps || [])
    } catch (error) {
      console.error('Failed to fetch apps:', error)
    } finally {
      setLoading(false)
    }
  }

  const normalizeUrl = (url: string): string => {
    // Add http:// if no protocol specified
    if (!url.match(/^https?:\/\//i)) {
      url = 'http://' + url
    }
    return url.trim()
  }

  const handleAddApp = (template: AppTemplate) => {
    setEditingApp(null)
    setSelectedTemplate(template)
    setFormData({
      name: `My ${template.name}`,
      base_url: `http://localhost:${template.defaultPort}`,
      api_key: '',
      password: ''
    })
    setTestResult(null)
    setShowModal(true)
  }

  const handleEditApp = (app: App) => {
    const template = APP_TEMPLATES.find(t => t.type === app.app_type)
    setEditingApp(app)
    setSelectedTemplate(template || null)
    setFormData({
      name: app.name,
      base_url: app.base_url,
      api_key: app.api_key || '',
      password: ''  // Don't show stored password
    })
    setTestResult(null)
    setShowModal(true)
  }

  const handleTestInModal = async () => {
    if (!selectedTemplate) return
    
    setTestingInModal(true)
    setTestResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_type: selectedTemplate.type,
          base_url: normalizeUrl(formData.base_url),
          api_key: formData.api_key || null,
          password: formData.password || null
        })
      })

      const result = await response.json()
      
      // Show toast notification instead of inline
      if (result.status === 'success') {
        showToast(result.message, 'success')
      } else {
        showToast(result.message, 'error')
      }
      
      // Still set result for reference but mainly use toast
      setTestResult(result)
    } catch (error) {
      const message = 'Failed to test connection'
      showToast(message, 'error')
      setTestResult({
        status: 'failed',
        message
      })
    } finally {
      setTestingInModal(false)
    }
  }

  const handleSaveApp = async () => {
    if (!selectedTemplate) return

    try {
      const url = editingApp 
        ? `${API_BASE_URL}/api/apps/${editingApp.id}`
        : `${API_BASE_URL}/api/apps`
      
      const method = editingApp ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          app_type: selectedTemplate.type,
          base_url: normalizeUrl(formData.base_url),
          api_key: formData.api_key || null,
          password: formData.password || null,
          enabled: true
        })
      })

      if (response.ok) {
        setShowModal(false)
        fetchApps()
        showToast(editingApp ? 'App updated successfully!' : 'App added successfully!', 'success')
      } else {
        const error = await response.json()
        showToast(error.detail || 'Failed to save app', 'error')
      }
    } catch (error) {
      showToast('Failed to save app', 'error')
    }
  }

  const handleTestConnection = async (app: App) => {
    setTesting(app.id)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${app.id}/test`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        showToast(result.message, 'success')
      } else {
        showToast(result.message, 'error')
      }
      
      fetchApps()
    } catch (error) {
      showToast('Failed to test connection', 'error')
    } finally {
      setTesting(null)
    }
  }


  const handleDeleteApp = async (appId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${appId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchApps()
        showToast('App deleted successfully', 'success')
        setDeleteConfirm(null)
      }
    } catch (error) {
      showToast('Failed to delete app', 'error')
    }
  }


  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-20 right-4 px-4 py-2 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white text-sm font-medium z-50 transition-opacity duration-300`
    toast.textContent = message
    toast.style.opacity = '0'
    document.body.appendChild(toast)
    
    // Fade in
    setTimeout(() => toast.style.opacity = '1', 10)
    
    // Fade out and remove
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'failed': return '❌'
      case 'pending': return '⏳'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-morpho-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🔌 Apps
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect to external services like Prowlarr, Jackett, and Kavita
        </p>
      </div>

      {/* Add App Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add New App
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {APP_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => handleAddApp(template)}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-morpho-primary hover:bg-morpho-primary/5 transition-all text-left group"
            >
              <div className="text-4xl mb-2">{template.icon}</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-morpho-primary">
                {template.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Connected Apps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Apps ({apps.length})
        </h3>

        {apps.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No apps connected yet. Add one above to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {APP_TEMPLATES.find(t => t.type === app.app_type)?.icon}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {app.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.app_type.charAt(0).toUpperCase() + app.app_type.slice(1)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">URL:</span> {app.base_url}
                      </p>
                      {app.last_test_at && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="font-medium">Last Test:</span>
                          <span>{getStatusIcon(app.last_test_status)}</span>
                          <span>{app.last_test_message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTestConnection(app)}
                      disabled={testing === app.id}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-sm font-medium transition-colors"
                      title="Test connection"
                    >
                      {testing === app.id ? '⏳' : '🔌'}
                    </button>
                    <button
                      onClick={() => handleEditApp(app)}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                      title="Edit connection"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({id: app.id, name: app.name})}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                      title="Delete connection"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit App Modal */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {selectedTemplate.icon} {editingApp ? 'Edit' : 'Add'} {selectedTemplate.name}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedTemplate.helpText}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`My ${selectedTemplate.name}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`10.0.0.50:${selectedTemplate.defaultPort} or http://localhost:${selectedTemplate.defaultPort}`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  http:// will be added automatically if not specified
                </p>
              </div>

              {selectedTemplate.requiresApiKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Your API key"
                  />
                </div>
              )}

              {selectedTemplate.requiresPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admin Password {selectedTemplate.type === 'jackett' && '(Optional)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Admin password"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Required if Jackett has password authentication enabled
                  </p>
                </div>
              )}

              {/* Test Result - Shows inline near button */}
              {testResult && (
                <div className={`p-3 rounded-lg border ${
                  testResult.status === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <p className={`text-sm font-medium ${
                    testResult.status === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {testResult.status === 'success' ? '✅' : '❌'} {testResult.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleTestInModal}
                disabled={testingInModal}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                {testingInModal ? '⏳ Testing...' : '🔌 Test Connection'}
              </button>
              <button
                onClick={handleSaveApp}
                className="flex-1 px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
              >
                {editingApp ? 'Update' : 'Add'} App
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeleteApp(deleteConfirm.id)}
        title={`Delete ${deleteConfirm?.name}?`}
        message="This will remove the app connection. You can add it back later if needed."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </div>
  )
}