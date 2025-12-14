// File: frontend/src/pages/LibraryPage.tsx
import { useEffect, useState } from 'react'
import { Book, BookListResponse } from '../types/book'
import { BookCard } from '../components/BookCard'
import { SearchBar } from '../components/SearchBar'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { BookDetailsModal } from '../components/BookDetailsModal'
import { API_BASE_URL } from '../config/api'

interface LibraryPageProps {
  onNavigate?: (page: 'home' | 'library' | 'settings') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

type MediaType = 'books' | 'audiobooks' | 'comics' | 'magazines'

interface TabConfig {
  id: MediaType
  label: string
  icon: string
  extensions: string[]
  libraryType: string  // Matches backend library_type
}

const MEDIA_TABS: TabConfig[] = [
  { id: 'books', label: 'Books', icon: '📕', extensions: ['epub', 'mobi', 'azw', 'azw3', 'pdf'], libraryType: 'books' },
  { id: 'audiobooks', label: 'Audiobooks', icon: '🎧', extensions: ['m4b', 'mp3', 'aac', 'ogg', 'flac', 'audiobook'], libraryType: 'audiobooks' },
  { id: 'comics', label: 'Comics', icon: '💥', extensions: ['cbz', 'cbr', 'cb7', 'cbt'], libraryType: 'comics' },
  { id: 'magazines', label: 'Magazines', icon: '📰', extensions: ['pdf'], libraryType: 'magazines' }
]

interface Library {
  id: number
  name: string
  path: string
  library_type: string
  enabled: boolean
}

export function LibraryPage({ onNavigate, onNavigateToLogs, currentTheme = 'morpho', onThemeChange }: LibraryPageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<MediaType>('books')
  const [libraries, setLibraries] = useState<Library[]>([])
  const [checkingLibraries, setCheckingLibraries] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  // Theme-based background classes
  const getBackgroundClass = () => {
    if (currentTheme === 'homestead') {
      return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-amber-950'
    }
    return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
  }

  // Check if libraries exist for current tab type
  const hasLibraryForActiveTab = () => {
    const currentTab = MEDIA_TABS.find(t => t.id === activeTab)
    if (!currentTab) return false
    
    return libraries.some(lib => 
      lib.library_type === currentTab.libraryType && lib.enabled
    )
  }

  // Fetch all libraries to check what's configured
  const fetchLibraries = async () => {
    setCheckingLibraries(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/libraries`)
      if (response.ok) {
        const data = await response.json()
        setLibraries(data.libraries || [])
      }
    } catch (err) {
      console.error('Error checking libraries:', err)
    } finally {
      setCheckingLibraries(false)
    }
  }

  const fetchBooks = async (query?: string, pageNum: number = 1, mediaType: MediaType = activeTab) => {
    // Don't fetch if no library configured for this type
    const currentTab = MEDIA_TABS.find(t => t.id === mediaType)
    if (!currentTab) return
    
    const hasLibrary = libraries.some(lib => 
      lib.library_type === currentTab.libraryType && lib.enabled
    )
    
    if (!hasLibrary) {
      setBooks([])
      setTotal(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        page_size: '35'
      })
      
      // Add media type filter
      const tab = MEDIA_TABS.find(t => t.id === mediaType)
      if (tab) {
        params.append('media_type', tab.extensions.join(','))
        // IMPORTANT: Also filter by library_type to prevent cross-contamination
        params.append('library_type', tab.libraryType)
      }
      
      if (query) {
        params.append('query', query)
      }
      
      const url = query 
        ? `/api/books/search?${params}`
        : `/api/books?${params}`
      
      const response = await fetch(`${API_BASE_URL}${url}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch books')
      }

      const data: BookListResponse = await response.json()
      setBooks(data.books)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.pages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching books:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLibraries()
  }, [])

  useEffect(() => {
    if (!checkingLibraries) {
      fetchBooks('', 1, activeTab)
    }
  }, [activeTab, checkingLibraries, libraries])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchBooks(query, 1, activeTab)
  }

  const handleTabChange = (tab: MediaType) => {
    setActiveTab(tab)
    setPage(1)
    setSearchQuery('')
  }

  const getEmptyStateMessage = () => {
    const tabLabel = MEDIA_TABS.find(t => t.id === activeTab)?.label || 'items'
    if (searchQuery) {
      return `No ${tabLabel.toLowerCase()} match your search for "${searchQuery}"`
    }
    return `No ${tabLabel.toLowerCase()} found in your library. Add some to get started!`
  }

  return (
    <>
      <Header onNavigate={onNavigate} currentPage="library" onThemeChange={onThemeChange} />
      <div className={`min-h-screen ${getBackgroundClass()} pt-24`}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
        
        {/* Media Type Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 gap-1 overflow-x-auto">
            {MEDIA_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-morpho-primary text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl sm:text-2xl">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* No Library for This Type - Show sleeping Morpho */}
        {!checkingLibraries && !hasLibraryForActiveTab() && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-8xl mb-6">🐛💤</div>
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              Morpho is Sleeping...
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              No <strong>{MEDIA_TABS.find(t => t.id === activeTab)?.label.toLowerCase()}</strong> library configured yet!
            </p>
            <p className="text-base text-gray-500 dark:text-gray-500 mb-8">
              Add a library to wake up Morpho and start your collection.
            </p>
            <button
              onClick={() => onNavigate?.('settings')}
              className="px-8 py-4 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              ⚙️ Add {MEDIA_TABS.find(t => t.id === activeTab)?.label} Library
            </button>
          </div>
        )}

        {/* Search Bar - Only show if library exists */}
        {!checkingLibraries && hasLibraryForActiveTab() && (
          <div className="flex justify-center mb-6 sm:mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder={`Search ${MEDIA_TABS.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
            />
          </div>
        )}

        {/* Results Count */}
        {!checkingLibraries && hasLibraryForActiveTab() && (
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
              {searchQuery ? (
                <>
                  Found <span className="font-bold text-morpho-dark dark:text-morpho-light">{total}</span> {MEDIA_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} matching "{searchQuery}"
                </>
              ) : (
                <>
                  Showing <span className="font-bold text-morpho-dark dark:text-morpho-light">{total}</span> {MEDIA_TABS.find(t => t.id === activeTab)?.label.toLowerCase()}
                </>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && hasLibraryForActiveTab() && (
          <div className="flex justify-center items-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-morpho-primary border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && hasLibraryForActiveTab() && (
          <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-xl text-red-600 dark:text-red-400 font-semibold mb-2">
              ❌ Error Loading {MEDIA_TABS.find(t => t.id === activeTab)?.label}
            </p>
            <p className="text-red-500 dark:text-red-300">{error}</p>
            <button
              onClick={() => fetchBooks(searchQuery, page, activeTab)}
              className="mt-4 px-6 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && hasLibraryForActiveTab() && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">
              {MEDIA_TABS.find(t => t.id === activeTab)?.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No {MEDIA_TABS.find(t => t.id === activeTab)?.label} Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {getEmptyStateMessage()}
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="px-6 py-3 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && hasLibraryForActiveTab() && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {books.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  status="available"
                  onBannerClick={() => setSelectedBook(book)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => {
                    const newPage = page - 1
                    setPage(newPage)
                    fetchBooks(searchQuery, newPage, activeTab)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  ← Previous
                </button>
                
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => {
                    const newPage = page + 1
                    setPage(newPage)
                    fetchBooks(searchQuery, newPage, activeTab)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Back to Top */}
        {books.length > 6 && hasLibraryForActiveTab() && (
          <div className="text-center mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
            >
              ⬆️ Back to Top
            </button>
          </div>
        )}
      </div>
      
      <Footer onNavigate={onNavigate} onNavigateToLogs={onNavigateToLogs} />
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdate={(updatedBook) => {
            // Update book in the list
            setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b))
            setSelectedBook(null)
          }}
        />
      )}
    </>
  )
}