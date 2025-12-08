import { useEffect, useState } from 'react'
import { Book, BookListResponse } from '../types/book'
import { BookCard } from '../components/BookCard'
import { SearchBar } from '../components/SearchBar'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { API_BASE_URL } from '../config/api'

interface BooksPageProps {
  onNavigate?: (page: 'home' | 'books' | 'settings') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export function BooksPage({ onNavigate, onNavigateToLogs, currentTheme = 'morpho', onThemeChange }: BooksPageProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Theme-based background classes
  const getBackgroundClass = () => {
    if (currentTheme === 'homestead') {
      return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-amber-950'
    }
    // Default: Morpho theme
    return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
  }

  const fetchBooks = async (query?: string, pageNum: number = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        page_size: '35' // 7 columns x 5 rows
      })
      
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
    fetchBooks()
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    fetchBooks(query, 1)
  }

  return (
    <>
      <Header onNavigate={onNavigate} currentPage="books" onThemeChange={onThemeChange} />
      <div className={`min-h-screen ${getBackgroundClass()} pt-24`}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
        
        {/* Search Bar */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Results Count */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            {searchQuery ? (
              <>
                Found <span className="font-bold text-morpho-dark dark:text-morpho-light">{total}</span> books matching "{searchQuery}"
              </>
            ) : (
              <>
                Showing <span className="font-bold text-morpho-dark dark:text-morpho-light">{total}</span> books
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-morpho-primary border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-xl text-red-600 dark:text-red-400 font-semibold mb-2">
              ❌ Error Loading Books
            </p>
            <p className="text-red-500 dark:text-red-300">{error}</p>
            <button
              onClick={() => fetchBooks(searchQuery)}
              className="mt-4 px-6 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Books Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? `No books match your search for "${searchQuery}"`
                : "Your library is empty. Add some books to get started!"
              }
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
        {!loading && !error && books.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => {
                    const newPage = page - 1
                    setPage(newPage)
                    fetchBooks(searchQuery, newPage)
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
                    fetchBooks(searchQuery, newPage)
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
        {books.length > 6 && (
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
    </>
  )
}