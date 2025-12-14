import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config/api'

interface DownloadClient {
  id: number
  name: string
  client_type: 'deluge' | 'qbittorrent' | 'transmission' | 'sabnzbd' | 'nzbget'
  host: string
  port: number
  username?: string
  password?: string
  api_key?: string
  use_ssl: boolean
  label_mappings?: LabelMappings
  enabled: boolean
  is_default: boolean
  last_test_status?: 'success' | 'failed' | 'pending'
  last_test_message?: string
  last_test_at?: string
  created_at: string
}

interface LabelMapping {
  label: string
  download_path: string
  extensions: string[]
}

interface LabelMappings {
  ebook?: LabelMapping
  audiobook?: LabelMapping
  comic?: LabelMapping
  magazine?: LabelMapping
}

interface ClientTemplate {
  type: 'deluge' | 'qbittorrent' | 'transmission' | 'sabnzbd' | 'nzbget'
  name: string
  icon: string
  description: string
  defaultPort: number
  requiresUsername: boolean
  requiresPassword: boolean
  requiresApiKey: boolean
  helpText: string
  protocol: string
}

const CLIENT_TEMPLATES: ClientTemplate[] = [
  {
    type: 'deluge',
    name: 'Deluge',
    icon: '🌊',
    description: 'Lightweight BitTorrent client',
    defaultPort: 8112,
    requiresUsername: false,
    requiresPassword: true,
    requiresApiKey: false,
    helpText: 'WebUI password required. Get from Deluge → Preferences → Interface → Password',
    protocol: 'http'
  },
  {
    type: 'qbittorrent',
    name: 'qBittorrent',
    icon: '💧',
    description: 'Feature-rich torrent client',
    defaultPort: 8080,
    requiresUsername: true,
    requiresPassword: true,
    requiresApiKey: false,
    helpText: 'WebUI username and password required. Default username is "admin"',
    protocol: 'http'
  },
  {
    type: 'transmission',
    name: 'Transmission',
    icon: '⚡',
    description: 'Simple and lightweight',
    defaultPort: 9091,
    requiresUsername: true,
    requiresPassword: true,
    requiresApiKey: false,
    helpText: 'Optional authentication. Username/password from settings.json',
    protocol: 'http'
  },
  {
    type: 'sabnzbd',
    name: 'SABnzbd',
    icon: '📦',
    description: 'Usenet binary downloader',
    defaultPort: 8080,
    requiresUsername: false,
    requiresPassword: false,
    requiresApiKey: true,
    helpText: 'API key required. Found in SABnzbd → Config → General → Security',
    protocol: 'http'
  },
  {
    type: 'nzbget',
    name: 'NZBGet',
    icon: '📥',
    description: 'Efficient Usenet downloader',
    defaultPort: 6789,
    requiresUsername: true,
    requiresPassword: true,
    requiresApiKey: false,
    helpText: 'Username and password from nzbget.conf',
    protocol: 'http'
  }
]

const DEFAULT_LABEL_MAPPINGS: LabelMappings = {
  ebook: {
    label: 'ebooks',
    download_path: '/downloads/ebooks',
    extensions: ['.epub', '.mobi', '.azw3', '.pdf']
  },
  audiobook: {
    label: 'audiobooks',
    download_path: '/downloads/audiobooks',
    extensions: ['.m4b', '.mp3', '.flac', '.aac']
  },
  comic: {
    label: 'comics',
    download_path: '/downloads/comics',
    extensions: ['.cbz', '.cbr', '.cb7', '.cbt']
  },
  magazine: {
    label: 'magazines',
    download_path: '/downloads/magazines',
    extensions: ['.pdf', '.epub']
  }
}

export function DownloadClientsSettings() {
  const [clients, setClients] = useState<DownloadClient[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ClientTemplate | null>(null)
  const [editingClient, setEditingClient] = useState<DownloadClient | null>(null)
  const [testing, setTesting] = useState<number | null>(null)
  const [testingInModal, setTestingInModal] = useState(false)
  const [testResult, setTestResult] = useState<{status: string, message: string} | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 8112,
    username: '',
    password: '',
    api_key: '',
    use_ssl: false,
    is_default: false,
    remove_completed: false,
    remove_failed: false,
    label_mappings: DEFAULT_LABEL_MAPPINGS
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/download-clients`)
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Failed to fetch download clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = (template: ClientTemplate) => {
    setEditingClient(null)
    setSelectedTemplate(template)
    setFormData({
      name: `My ${template.name}`,
      host: 'localhost',
      port: template.defaultPort,
      username: '',
      password: '',
      api_key: '',
      use_ssl: false,
      is_default: clients.length === 0, // Auto-default if first client
      remove_completed: false,
      remove_failed: false,
      label_mappings: DEFAULT_LABEL_MAPPINGS
    })
    setTestResult(null)
    setShowTemplateModal(false)
    setShowConfigModal(true)
  }

  const handleOpenAddClient = () => {
    setShowTemplateModal(true)
  }

  const handleEditClient = (client: DownloadClient) => {
    const template = CLIENT_TEMPLATES.find(t => t.type === client.client_type)
    setEditingClient(client)
    setSelectedTemplate(template || null)
    setFormData({
      name: client.name,
      host: client.host,
      port: client.port,
      username: client.username || '',
      password: '',  // Don't show stored password
      api_key: client.api_key || '',
      use_ssl: client.use_ssl,
      is_default: client.is_default,
      remove_completed: (client as any).remove_completed || false,
      remove_failed: (client as any).remove_failed || false,
      label_mappings: client.label_mappings || DEFAULT_LABEL_MAPPINGS
    })
    setTestResult(null)
    setShowConfigModal(true)
  }

  const handleTestInModal = async () => {
    if (!selectedTemplate) return
    
    setTestingInModal(true)
    setTestResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/download-clients/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_type: selectedTemplate.type,
          host: formData.host,
          port: formData.port,
          username: formData.username || null,
          password: formData.password || null,
          api_key: formData.api_key || null,
          use_ssl: formData.use_ssl
        })
      })

      const result = await response.json()
      
      if (result.status === 'success') {
        showToast(result.message, 'success')
      } else {
        showToast(result.message, 'error')
      }
      
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

  const handleSaveClient = async () => {
    if (!selectedTemplate) return

    try {
      const url = editingClient 
        ? `${API_BASE_URL}/api/download-clients/${editingClient.id}`
        : `${API_BASE_URL}/api/download-clients`
      
      const method = editingClient ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          client_type: selectedTemplate.type,
          host: formData.host,
          port: formData.port,
          username: formData.username || null,
          password: formData.password || null,
          api_key: formData.api_key || null,
          use_ssl: formData.use_ssl,
          is_default: formData.is_default,
          label_mappings: formData.label_mappings,
          enabled: true
        })
      })

      if (response.ok) {
        setShowConfigModal(false)
        fetchClients()
        showToast(editingClient ? 'Client updated successfully!' : 'Client added successfully!', 'success')
      } else {
        const error = await response.json()
        showToast(error.detail || 'Failed to save client', 'error')
      }
    } catch (error) {
      showToast('Failed to save client', 'error')
    }
  }

  const handleTestConnection = async (client: DownloadClient) => {
    setTesting(client.id)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/download-clients/${client.id}/test`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        showToast(result.message, 'success')
      } else {
        showToast(result.message, 'error')
      }
      
      fetchClients()
    } catch (error) {
      showToast('Failed to test connection', 'error')
    } finally {
      setTesting(null)
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this download client?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/download-clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchClients()
        showToast('Client deleted successfully', 'success')
      }
    } catch (error) {
      showToast('Failed to delete client', 'error')
    }
  }

  const handleLabelMappingChange = (
    mediaType: keyof LabelMappings,
    field: keyof LabelMapping,
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      label_mappings: {
        ...prev.label_mappings,
        [mediaType]: {
          ...prev.label_mappings[mediaType],
          [field]: value
        }
      }
    }))
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-20 right-4 px-4 py-2 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white text-sm font-medium z-50 transition-opacity duration-300`
    toast.textContent = message
    toast.style.opacity = '0'
    document.body.appendChild(toast)
    
    setTimeout(() => toast.style.opacity = '1', 10)
    
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
          📥 Download Clients
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect to torrent and usenet download clients. Configure labels for automatic organization.
        </p>
      </div>

      {/* Connected Clients & Add Button */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {clients.length > 0 ? `Connected Clients (${clients.length})` : 'Download Clients'}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Existing Clients */}
          {clients.map(client => {
            const template = CLIENT_TEMPLATES.find(t => t.type === client.client_type)
            return (
              <div
                key={client.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template?.icon || '📥'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {client.name}
                        </h4>
                        {client.is_default && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {client.host}:{client.port}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(client)}
                      disabled={testing === client.id}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testing === client.id ? '⏳ Testing...' : '🔍 Test'}
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="px-3 py-1 bg-morpho-primary hover:bg-morpho-accent text-white rounded text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`text-sm font-medium ${
                    client.last_test_status === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : client.last_test_status === 'failed'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {getStatusIcon(client.last_test_status)} {client.last_test_message || 'Not tested'}
                  </span>
                </div>

                {/* Label Mappings Preview */}
                {client.label_mappings && Object.keys(client.label_mappings).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Label Mappings:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(client.label_mappings).map(([mediaType, mapping]: [string, any]) => (
                        <span
                          key={mediaType}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {mapping.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add Client Button */}
          <button
            onClick={handleOpenAddClient}
            className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-morpho-primary dark:hover:border-morpho-accent hover:bg-gray-50 dark:hover:bg-gray-750 transition-all group flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="text-6xl mb-3 group-hover:scale-110 transition-transform">➕</div>
            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-morpho-primary dark:group-hover:text-morpho-accent text-lg">
              Add Download Client
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connect Deluge, qBittorrent, and more
            </p>
          </button>
        </div>
      </div>

      {/* Empty State (if no clients) */}
      {clients.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <p className="text-sm">
            Click the card above to add your first download client
          </p>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Choose Download Client
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Select the type of client you want to connect
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CLIENT_TEMPLATES.map(template => (
                  <button
                    key={template.type}
                    onClick={() => handleAddClient(template)}
                    className="bg-white dark:bg-gray-750 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-morpho-primary dark:hover:border-morpho-accent transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{template.icon}</span>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-morpho-primary dark:group-hover:text-morpho-accent">
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Default port: {template.defaultPort}
                          </p>
                        </div>
                      </div>
                      {template.type === 'deluge' && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded font-medium">
                          Ready
                        </span>
                      )}
                      {template.type !== 'deluge' && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded font-medium">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                      {template.helpText}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Config/Edit Modal */}
      {showConfigModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingClient ? 'Edit' : 'Add'} {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTemplate.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Help Text */}
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-200">
                💡 {selectedTemplate.helpText}
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="My Deluge"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-morpho-primary dark:text-white"
                  />
                </div>

                {/* Host & Port */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Host *
                    </label>
                    <input
                      type="text"
                      value={formData.host}
                      onChange={(e) => setFormData({...formData, host: e.target.value})}
                      placeholder="localhost or 10.0.0.50"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-morpho-primary dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Port *
                    </label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-morpho-primary dark:text-white"
                    />
                  </div>
                </div>

                {/* Username (if required) */}
                {selectedTemplate.requiresUsername && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username {selectedTemplate.requiresUsername ? '*' : ''}
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="admin"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-morpho-primary dark:text-white"
                    />
                  </div>
                )}

                {/* Password (if required) */}
                {selectedTemplate.requiresPassword && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password {editingClient ? '' : '(optional)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={editingClient ? '(leave blank to keep current)' : 'Leave blank if no password'}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-morpho-primary dark:text-white"
                    />
                  </div>
                )}

                {/* API Key (if required) */}
                {selectedTemplate.requiresApiKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Key *
                    </label>
                    <input
                      type="text"
                      value={formData.api_key}
                      onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                      placeholder="Your API key"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-morpho-primary dark:text-white font-mono text-sm"
                    />
                  </div>
                )}

                {/* SSL Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use_ssl"
                    checked={formData.use_ssl}
                    onChange={(e) => setFormData({...formData, use_ssl: e.target.checked})}
                    className="w-4 h-4 text-morpho-primary rounded focus:ring-2 focus:ring-morpho-primary"
                  />
                  <label htmlFor="use_ssl" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Use SSL/HTTPS
                  </label>
                </div>

                {/* Default Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="w-4 h-4 text-morpho-primary rounded focus:ring-2 focus:ring-morpho-primary"
                  />
                  <label htmlFor="is_default" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make this my default client
                  </label>
                </div>

                {/* Remove Completed Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remove_completed"
                    checked={formData.remove_completed}
                    onChange={(e) => setFormData({...formData, remove_completed: e.target.checked})}
                    className="w-4 h-4 text-morpho-primary rounded focus:ring-2 focus:ring-morpho-primary"
                  />
                  <label htmlFor="remove_completed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Remove completed downloads from client
                  </label>
                </div>

                {/* Remove Failed Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remove_failed"
                    checked={formData.remove_failed}
                    onChange={(e) => setFormData({...formData, remove_failed: e.target.checked})}
                    className="w-4 h-4 text-morpho-primary rounded focus:ring-2 focus:ring-morpho-primary"
                  />
                  <label htmlFor="remove_failed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Remove failed downloads from client
                  </label>
                </div>

                {/* Label Mappings - Only for Deluge for now */}
                {selectedTemplate.type === 'deluge' && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Label Mappings
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Configure labels for automatic categorization based on file extensions
                    </p>
                    
                    <div className="space-y-4">
                      {Object.entries(formData.label_mappings).map(([mediaType, mapping]) => (
                        <div key={mediaType} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                            {mediaType === 'ebook' ? '📚 eBooks' : 
                             mediaType === 'audiobook' ? '🎧 Audiobooks' :
                             mediaType === 'comic' ? '📖 Comics' :
                             '📰 Magazines'}
                          </h5>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Label in Deluge
                              </label>
                              <input
                                type="text"
                                value={mapping.label}
                                onChange={(e) => handleLabelMappingChange(
                                  mediaType as keyof LabelMappings,
                                  'label',
                                  e.target.value
                                )}
                                className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-morpho-primary dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Download Path
                              </label>
                              <input
                                type="text"
                                value={mapping.download_path}
                                onChange={(e) => handleLabelMappingChange(
                                  mediaType as keyof LabelMappings,
                                  'download_path',
                                  e.target.value
                                )}
                                className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-morpho-primary dark:text-white font-mono"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                File Extensions (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={mapping.extensions.join(', ')}
                                onChange={(e) => handleLabelMappingChange(
                                  mediaType as keyof LabelMappings,
                                  'extensions',
                                  e.target.value.split(',').map(ext => ext.trim())
                                )}
                                className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-morpho-primary dark:text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`mt-4 p-3 rounded ${
                  testResult.status === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <p className={`text-sm ${
                    testResult.status === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {getStatusIcon(testResult.status)} {testResult.message}
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleTestInModal}
                  disabled={testingInModal}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testingInModal ? '⏳ Testing...' : '🔍 Test Connection'}
                </button>
                <button
                  onClick={handleSaveClient}
                  className="flex-1 px-4 py-2 bg-morpho-primary hover:bg-morpho-accent text-white rounded-lg font-medium"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}