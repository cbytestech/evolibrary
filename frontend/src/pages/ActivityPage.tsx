// File: frontend/src/pages/ActivityPage.tsx

import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { API_BASE_URL } from '../config/api'
import { getThemeBackground } from '../utils/themes'

interface ActivityPageProps {
  onNavigate?: (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

interface MonitoredBook {
  id: number
  title: string
  author_name: string | null
  cover_url: string | null
  status: string
  monitored: boolean
  quality_profile_id: number | null
  last_search_at: string | null
  search_status: 'idle' | 'searching' | 'found' | 'failed'
  search_message: string | null
  created_at: string
}

export function ActivityPage({
  onNavigate,
  onNavigateToLogs,
  currentTheme = 'morpho',
  onThemeChange
}: ActivityPageProps) {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue')
  const [monitoredBooks, setMonitoredBooks] = useState<MonitoredBook[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState<Set<number>>(new Set())

  const getBackgroundClass = () => {
    if (currentTheme === 'homestead') {
      return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950 dark:via-emerald-950 dark:to-amber-950'
    }
    return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
  }

  const fetchMonitoredBooks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books?monitored=true`)
      if (response.ok) {
        const data = await response.json()
        setMonitoredBooks(data.books || [])
      }
    } catch (err) {
      console.error('Failed to fetch monitored books:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResearch = async (bookId: number) => {
    setSearching(prev => new Set(prev).add(bookId))

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/search`, {
        method: 'POST'
      })

      if (response.ok) {
        setTimeout(() => {
          fetchMonitoredBooks()
          setSearching(prev => {
            const newSet = new Set(prev)
            newSet.delete(bookId)
            return newSet
          })
        }, 2000)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setSearching(prev => {
        const newSet = new Set(prev)
        newSet.delete(bookId)
        return newSet
      })
    }
  }

  const handleRemoveMonitoring = async (bookId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitored: false })
      })

      if (response.ok) {
        fetchMonitoredBooks()
      }
    } catch (err) {
      console.error('Failed to update monitoring:', err)
    }
  }

  useEffect(() => {
    fetchMonitoredBooks()
    const interval = setInterval(fetchMonitoredBooks, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (book: MonitoredBook) => {
    if (searching.has(book.id)) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
          Searching...
        </span>
      )
    }

    switch (book.status) {
      case 'available':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            📖 Available
          </span>
        )
      case 'monitoring':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            👁️ Monitoring
          </span>
        )
      case 'downloading':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-600 border-t-transparent"></div>
            Downloading
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            Unknown
          </span>
        )
    }
  }

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never'

    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onNavigate={onNavigate} 
        currentPage="activity" 
        onThemeChange={onThemeChange} 
      />
      
      <main className={`flex-1 ${getThemeBackground(currentTheme)} pt-24`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Activity
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track monitored books and search activity
            </p>
          </div>

          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'queue'
                    ? 'border-morpho-primary text-morpho-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                📋 Queue ({monitoredBooks.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'history'
                    ? 'border-morpho-primary text-morpho-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                📜 History
              </button>
            </div>
          </div>

          {activeTab === 'queue' && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-morpho-primary border-t-transparent"></div>
                </div>
              ) : monitoredBooks.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📭</div>
                  <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    No Monitored Books
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Books you monitor will appear here
                  </p>
                  <button
                    onClick={() => onNavigate?.('search')}
                    className="px-6 py-3 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
                  >
                    🔍 Search for Books
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Book</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Last Search</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Added</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {monitoredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {book.cover_url ? (
                                <img 
                                  src={book.cover_url} 
                                  alt={book.title}
                                  className="w-12 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                  <span className="text-2xl">📚</span>
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {book.title}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {book.author_name || 'Unknown Author'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(book)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatTimeAgo(book.last_search_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatTimeAgo(book.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResearch(book.id)}
                                disabled={searching.has(book.id)}
                                className="px-3 py-1 text-sm bg-morpho-primary hover:bg-morpho-dark text-white rounded font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                🔄 Re-search
                              </button>
                              <button
                                onClick={() => handleRemoveMonitoring(book.id)}
                                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded font-medium transition-colors"
                              >
                                ❌ Unmonitor
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Search history will be available in a future update
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} onNavigateToLogs={onNavigateToLogs} />
    </div>
  )
}