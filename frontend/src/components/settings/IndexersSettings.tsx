import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../config/api'

interface Indexer {
  id: number
  name: string
  description: string
  protocol: 'torrent' | 'usenet'
  categories: string[]
  enabled: boolean
  configured: boolean
  priority: number
  app_name: string
  app_type: string
  total_searches: number
  total_grabs: number
  last_search_at: string | null
  last_sync_at: string | null
}

interface IndexerStats {
  total: number
  enabled: number
  configured: number
}

export function IndexersSettings() {
  const [indexers, setIndexers] = useState<Indexer[]>([])
  const [stats, setStats] = useState<IndexerStats>({ total: 0, enabled: 0, configured: 0 })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [protocolFilter, setProtocolFilter] = useState<'all' | 'torrent' | 'usenet'>('all')
  const [showEnabledOnly, setShowEnabledOnly] = useState(false)
  const [showConfiguredOnly, setShowConfiguredOnly] = useState(false)
  const [showNotConfiguredOnly, setShowNotConfiguredOnly] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('')
  const [quickFilter, setQuickFilter] = useState<string>('all')

  useEffect(() => {
    fetchIndexers()
  }, [showEnabledOnly, protocolFilter, searchTerm, showConfiguredOnly, showNotConfiguredOnly])

  const fetchIndexers = async () => {
    try {
      const params = new URLSearchParams()
      if (showEnabledOnly) params.append('enabled_only', 'true')
      if (showConfiguredOnly) params.append('configured_only', 'true')
      if (protocolFilter !== 'all') params.append('protocol', protocolFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${API_BASE_URL}/api/indexers?${params}`)
      const data = await response.json()
      
      let filtered = data.indexers || []
      
      // Client-side filter for "not configured"
      if (showNotConfiguredOnly) {
        filtered = filtered.filter((idx: Indexer) => !idx.configured)
      }
      
      setIndexers(filtered)
      setStats(data.stats || { total: 0, enabled: 0, configured: 0 })
    } catch (error) {
      console.error('Failed to fetch indexers:', error)
      showToast('Failed to load indexers', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/indexers/sync`, {
        method: 'POST'
      })
      const result = await response.json()
      
      if (result.status === 'success' || result.status === 'partial') {
        showToast(result.message, 'success')
        fetchIndexers()
      } else {
        showToast('Sync failed', 'error')
      }
    } catch (error) {
      showToast('Failed to sync indexers', 'error')
    } finally {
      setSyncing(false)
    }
  }

  const toggleIndexer = async (indexerId: number, currentEnabled: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/indexers/${indexerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled })
      })

      if (response.ok) {
        setIndexers(indexers.map(idx =>
          idx.id === indexerId ? { ...idx, enabled: !currentEnabled } : idx
        ))
        showToast(`Indexer ${!currentEnabled ? 'enabled' : 'disabled'}`, 'success')
      }
    } catch (error) {
      showToast('Failed to update indexer', 'error')
    }
  }

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === indexers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(indexers.map(idx => idx.id)))
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return

    if (bulkAction === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.size} indexers?`)) {
        return
      }
    }

    try {
      if (bulkAction === 'delete') {
        // Delete each indexer
        const promises = Array.from(selectedIds).map(id =>
          fetch(`${API_BASE_URL}/api/indexers/${id}`, { method: 'DELETE' })
        )
        await Promise.all(promises)
        showToast(`${selectedIds.size} indexers deleted`, 'success')
        fetchIndexers()
      } else {
        // Enable/disable
        const enabled = bulkAction === 'enable'
        const response = await fetch(`${API_BASE_URL}/api/indexers/bulk-enable`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            indexer_ids: Array.from(selectedIds),
            enabled: enabled
          })
        })

        if (response.ok) {
          showToast(`${selectedIds.size} indexers ${enabled ? 'enabled' : 'disabled'}`, 'success')
          // Refetch to update UI
          await fetchIndexers()
        } else {
          const errorText = await response.text()
          console.error('Bulk enable failed:', response.status, errorText)
          showToast('Failed to update indexers', 'error')
        }
      }
      
      setSelectedIds(new Set())
      setBulkAction('')
      setQuickFilter('clear')
    } catch (error) {
      showToast('Bulk action failed', 'error')
    }
  }

  const handleQuickFilter = (value: string) => {
    setQuickFilter(value)
    
    // Update filter states
    if (value === 'clear') {
      setShowEnabledOnly(false)
      setShowConfiguredOnly(false)
      setShowNotConfiguredOnly(false)
      // Clear all selections
      setSelectedIds(new Set())
    } else if (value === 'all') {
      setShowEnabledOnly(false)
      setShowConfiguredOnly(false)
      setShowNotConfiguredOnly(false)
      // Select ALL indexers
      setSelectedIds(new Set(indexers.map(idx => idx.id)))
    } else if (value === 'not_configured') {
      setShowConfiguredOnly(false)
      setShowEnabledOnly(false)
      setShowNotConfiguredOnly(true)
      // Select only unconfigured indexers
      const unconfiguredIds = indexers
        .filter(idx => !idx.configured)
        .map(idx => idx.id)
      setSelectedIds(new Set(unconfiguredIds))
    } else if (value === 'configured') {
      setShowConfiguredOnly(true)
      setShowEnabledOnly(false)
      setShowNotConfiguredOnly(false)
      // Select only configured indexers
      const configuredIds = indexers
        .filter(idx => idx.configured)
        .map(idx => idx.id)
      setSelectedIds(new Set(configuredIds))
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div')
    toast.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white z-50 transition-all duration-300 opacity-0`
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => { toast.style.opacity = '1' }, 10)
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  const getProtocolBadge = (protocol: string) => {
    if (protocol === 'torrent') {
      return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">🌊 Torrent</span>
    }
    return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">📰 Usenet</span>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-morpho-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🔍 Indexers
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage search indexers from Prowlarr and Jackett
          </p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Syncing...
            </>
          ) : (
            <>🔄 Sync from Apps</>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Indexers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.enabled}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Enabled</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.configured}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Configured</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Search indexers..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Protocol Filter */}
          <div>
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Protocols</option>
              <option value="torrent">🌊 Torrent Only</option>
              <option value="usenet">📰 Usenet Only</option>
            </select>
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showEnabledOnly}
                onChange={(e) => setShowEnabledOnly(e.target.checked)}
                className="rounded"
              />
              Enabled only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showConfiguredOnly}
                onChange={(e) => setShowConfiguredOnly(e.target.checked)}
                className="rounded"
              />
              Configured only
            </label>
          </div>
        </div>
      </div>

      {/* Indexers Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {indexers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Indexers Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Sync from Apps" to import indexers from your connected Prowlarr and Jackett instances
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === indexers.length && indexers.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
                Select All ({indexers.length} indexers)
              </label>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {indexers.map((indexer) => (
                <div
                  key={indexer.id}
                  className={`relative border rounded-lg p-3 transition-all ${
                    selectedIds.has(indexer.id)
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(indexer.id)}
                      onChange={() => toggleSelection(indexer.id)}
                      className="rounded"
                    />
                  </div>

                  {/* Toggle */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleIndexer(indexer.id, indexer.enabled)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        indexer.enabled
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      title={indexer.enabled ? 'Disable' : 'Enable'}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          indexer.enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="mt-6 mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 pr-12">
                      {indexer.name}
                    </h4>

                    <div className="flex items-center gap-2 mb-2">
                      {getProtocolBadge(indexer.protocol)}
                      {!indexer.configured && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          ⚠️ Not Configured
                        </span>
                      )}
                    </div>

                    {indexer.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {indexer.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>📦 {indexer.app_name}</span>
                      <span>⚡ P:{indexer.priority}</span>
                      {indexer.total_searches > 0 && (
                        <span>🔍 {indexer.total_searches}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bulk Actions Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Quick Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                Quick Select:
              </label>
              <select
                value={quickFilter}
                onChange={(e) => handleQuickFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="clear">Clear Selection</option>
                <option value="all">✅ Select All ({indexers.length})</option>
                <option value="not_configured">⚠️ Select Not Configured</option>
                <option value="configured">✔️ Select Configured</option>
              </select>
            </div>

            {/* Right: Bulk Actions */}
            <div className="flex items-center gap-3">
              {selectedIds.size > 0 && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedIds.size} selected
                </span>
              )}
              
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                disabled={selectedIds.size === 0}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">Actions...</option>
                <option value="enable">✅ Enable</option>
                <option value="disable">❌ Disable</option>
                <option value="delete">🗑️ Remove</option>
              </select>

              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedIds.size === 0}
                className="px-4 py-2 text-sm bg-morpho-primary hover:bg-morpho-dark disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                Apply
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={() => {
                    setSelectedIds(new Set())
                    setQuickFilter('clear')
                  }}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:block"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}