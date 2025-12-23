// File: frontend/src/pages/SearchPage.tsx - CORRECTED VERSION

import { useState, useEffect, useCallback, useRef } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { API_BASE_URL } from '../config/api'
import { getThemeBackground } from '../utils/themes'
import { DownloadModal } from '../components/DownloadModal'

interface SearchPageProps {
  onNavigate?: (page: 'home' | 'library' | 'settings' | 'search' | 'activity' | 'achievements') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

interface GoogleBook {
  id: string
  title: string
  authors: string[]
  description?: string
  publishedDate?: string
  pageCount?: number
  categories?: string[]
  language?: string
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
  }
  industryIdentifiers?: Array<{
    type: string
    identifier: string
  }>
}

interface IndexerResult {
  title: string
  download_url: string
  indexer_id: number
  indexer_name: string
  size_bytes: number
  size_mb: number
  seeders: number
  protocol: string
  publish_date: string | null
  info_url: string | null
  categories: string[]
  file_format: string | null
  media_type?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function SearchPage({ 
  onNavigate, 
  onNavigateToLogs, 
  currentTheme = 'morpho', 
  onThemeChange 
}: SearchPageProps) {
  const [query, setQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'google' | 'direct'>('direct')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [googleBooks, setGoogleBooks] = useState<GoogleBook[]>([])
  const [indexerResults, setIndexerResults] = useState<IndexerResult[]>([])
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchingIndexers, setSearchingIndexers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [downloadModal, setDownloadModal] = useState<IndexerResult | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    const prefillSearch = localStorage.getItem('evolibrary_prefill_search')
    if (prefillSearch) {
      setQuery(prefillSearch)
      localStorage.removeItem('evolibrary_prefill_search')
    }
  }, [])

  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setSearching(false)
    setSearchingIndexers(false)
  }, [])

  const searchGoogleBooks = useCallback(async (searchQuery: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setSearching(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        maxResults: '20'
      })
      
      if (selectedLanguage) {
        params.append('langRestrict', selectedLanguage)
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${params}`,
        { signal: abortControllerRef.current.signal }
      )

      if (!response.ok) {
        throw new Error('Google Books search failed')
      }

      const data = await response.json()
      
      const books: GoogleBook[] = (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || [],
        description: item.volumeInfo.description,
        publishedDate: item.volumeInfo.publishedDate,
        pageCount: item.volumeInfo.pageCount,
        categories: item.volumeInfo.categories,
        language: item.volumeInfo.language,
        imageLinks: item.volumeInfo.imageLinks,
        industryIdentifiers: item.volumeInfo.industryIdentifiers
      }))

      setGoogleBooks(books)
      setSearching(false)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Google Books search error:', err)
        setError('Google Books search failed')
        setSearching(false)
      }
    }
  }, [selectedLanguage])

  const searchIndexers = useCallback(async (searchQuery: string, contextBook?: GoogleBook) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setSearchingIndexers(true)
    setError(null)
    setIndexerResults([])

    try {
      const params: any = {
        query: searchQuery,
        search_type: 'search'
      }

      const response = await fetch(`${API_BASE_URL}/api/search/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal
      })

      const data = await response.json()
      
      const results = Array.isArray(data) ? data : (data.results || [])
      
      if (!response.ok || (results.length === 0 && response.status === 400)) {
        throw new Error('Indexers may be unavailable or search failed')
      }

      setIndexerResults(results)
      setSearchingIndexers(false)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Indexer search error:', err)
        const errorMsg = (err as Error).message || 'Indexer search failed'
        setError(errorMsg)
        setSearchingIndexers(false)
        setIndexerResults([])
        
        setToast({
          message: errorMsg + '. Check if Prowlarr indexers are enabled and available.',
          type: 'error'
        })
        setTimeout(() => setToast(null), 5000)
      }
    } finally {
      if (abortControllerRef.current) {
        abortControllerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      if (searchMode === 'google') {
        searchGoogleBooks(debouncedQuery)
        setIndexerResults([])
        setSelectedBook(null)
      } else {
        searchIndexers(debouncedQuery)
        setGoogleBooks([])
      }
    } else if (debouncedQuery.trim().length === 0) {
      setGoogleBooks([])
      setIndexerResults([])
      setError(null)
      setSelectedBook(null)
    }
  }, [debouncedQuery, searchMode, searchGoogleBooks, searchIndexers])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const saveSearchToHistory = useCallback((searchQuery: string) => {
    try {
      const searches = localStorage.getItem('evolibrary_recent_searches')
      const recentSearches = searches ? JSON.parse(searches) : []
      
      const updated = [
        { query: searchQuery, timestamp: Date.now() },
        ...recentSearches.filter((s: any) => s.query !== searchQuery)
      ].slice(0, 10)
      
      localStorage.setItem('evolibrary_recent_searches', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearchToHistory(query.trim())
      if (searchMode === 'google') {
        searchGoogleBooks(query)
      } else {
        searchIndexers(query)
      }
    }
  }

  const handleFindDownloads = (book: GoogleBook) => {
    setSelectedBook(book)
    const searchQuery = book.authors.length > 0 
      ? `${book.title} ${book.authors[0]}`
      : book.title
    searchIndexers(searchQuery, book)
  }

  const handleDownload = async (result: IndexerResult, selectedMediaType: string) => {
    const downloadKey = result.download_url
    setDownloading(prev => new Set(prev).add(downloadKey))

    try {
      const currentCount = parseInt(localStorage.getItem('evolibrary_download_count') || '0')
      localStorage.setItem('evolibrary_download_count', (currentCount + 1).toString())

      const response = await fetch(`${API_BASE_URL}/api/search/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          download_url: result.download_url,
          title: result.title,
          media_type: selectedMediaType,
          file_format: result.file_format,
          indexer_id: result.indexer_id
        })
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      setToast({ 
        message: `✅ Sent to Deluge: ${result.title.substring(0, 50)}...`, 
        type: 'success' 
      })
      setTimeout(() => setToast(null), 5000)

    } catch (err) {
      console.error('Download error:', err)
      setToast({ 
        message: `❌ ${err instanceof Error ? err.message : 'Download failed'}`, 
        type: 'error' 
      })
      setTimeout(() => setToast(null), 5000)
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev)
        newSet.delete(downloadKey)
        return newSet
      })
    }
  }

  const handleDownloadConfirm = async (mediaType: string) => {
    if (!downloadModal) return
    
    await handleDownload(downloadModal, mediaType)
    setDownloadModal(null)
  }

  const formatSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(2)} GB`
  }

  const getISBN = (book: GoogleBook) => {
    return book.industryIdentifiers?.find(i => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier
  }

  const filteredIndexerResults = indexerResults
  const filteredGoogleBooks = googleBooks.filter(book => 
    !selectedLanguage || book.language === selectedLanguage
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onNavigate={onNavigate} 
        currentPage="search" 
        onThemeChange={onThemeChange} 
      />
      
      <main className={`flex-1 ${getThemeBackground(currentTheme)} pt-24`}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔍 Search & Download
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search for books and send them to your download client
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchMode === 'google' 
                  ? "Search books by title or author (fast)..." 
                  : "Search indexers directly..."}
                className="flex-1 px-6 py-4 text-lg rounded-lg border-2 border-morpho-primary/30 focus:border-morpho-primary focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              
              {!(searching || searchingIndexers) ? (
                <button
                  type="submit"
                  disabled={!query.trim() || query.trim().length < 3}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                    !query.trim() || query.trim().length < 3
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-morpho-primary hover:bg-morpho-dark text-white'
                  }`}
                >
                  🔍 Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={cancelSearch}
                  className="px-8 py-4 rounded-lg font-semibold text-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  ✖ Cancel
                </button>
              )}
            </div>
            {query.trim().length > 0 && query.trim().length < 3 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Type at least 3 characters to search...
              </p>
            )}
          </form>

          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Mode:</span>
            <button
              onClick={() => {
                setSearchMode('google')
                setIndexerResults([])
                setSelectedBook(null)
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                searchMode === 'google'
                  ? 'bg-morpho-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📚 Books
            </button>
            <button
              onClick={() => {
                setSearchMode('direct')
                setGoogleBooks([])
                setSelectedBook(null)
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                searchMode === 'direct'
                  ? 'bg-morpho-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              ⚡ Direct
            </button>

            <span className="text-gray-400 dark:text-gray-600">|</span>

            {searchMode === 'google' && (
              <>
                <label className="font-medium text-gray-700 dark:text-gray-300">
                  Language:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </>
            )}
          </div>

          {toast && (
            <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {toast.message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          )}

          {(searching || searchingIndexers) && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-morpho-primary border-t-transparent"></div>
            </div>
          )}

          {searchMode === 'google' && filteredGoogleBooks.length > 0 && !searching && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📚 Found {filteredGoogleBooks.length} books
              </h2>
              {filteredGoogleBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-6">
                    {book.imageLinks?.thumbnail && (
                      <img
                        src={book.imageLinks.thumbnail}
                        alt={book.title}
                        className="w-32 h-48 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {book.title}
                      </h3>
                      {book.authors.length > 0 && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          by {book.authors.join(', ')}
                        </p>
                      )}
                      {book.description && (
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                          {book.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {book.publishedDate && (
                          <span>📅 {book.publishedDate}</span>
                        )}
                        {book.pageCount && (
                          <span>📄 {book.pageCount} pages</span>
                        )}
                        {getISBN(book) && (
                          <span>🔖 ISBN: {getISBN(book)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleFindDownloads(book)}
                        className="px-6 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
                      >
                        🔍 Find Downloads
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredIndexerResults.length > 0 && !searchingIndexers && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedBook && `📥 Downloads for "${selectedBook.title}"`}
                {!selectedBook && `🔗 Found ${filteredIndexerResults.length} results`}
              </h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Seeds</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Indexer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredIndexerResults.map((result, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {result.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatSize(result.size_mb)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className={result.seeders > 5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {result.seeders} 🌱
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {result.file_format?.toUpperCase() || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {result.indexer_name}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDownloadModal(result)}
                            disabled={downloading.has(result.download_url)}
                            className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded font-semibold transition-colors"
                          >
                            {downloading.has(result.download_url) ? '⏳' : '📥'} Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedBook && (
                <button
                  onClick={() => {
                    setSelectedBook(null)
                    setIndexerResults([])
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  ← Back to Books
                </button>
              )}
            </div>
          )}

          {!searching && !searchingIndexers && query.trim().length >= 3 && 
           filteredGoogleBooks.length === 0 && filteredIndexerResults.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Results Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Try different search terms or switch search modes
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer onNavigate={onNavigate} onNavigateToLogs={onNavigateToLogs} />

      {/* Download Modal */}
      {downloadModal && (
        <DownloadModal
          result={downloadModal}
          onConfirm={handleDownloadConfirm}
          onCancel={() => setDownloadModal(null)}
        />
      )}
    </div>
  )
}