// File: frontend/src/components/BookDetailsModal.tsx
import { useState } from 'react'
import { Book } from '../types/book'
import { API_BASE_URL } from '../config/api'
import { Toast } from './Toast'

interface BookDetailsModalProps {
  book: Book
  onClose: () => void
  onUpdate?: (updatedBook: Book) => void
}

interface GoogleBookResult {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    publishedDate?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

export function BookDetailsModal({ book, onClose, onUpdate }: BookDetailsModalProps) {
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([])
  const [selectedResult, setSelectedResult] = useState<GoogleBookResult | null>(null)
  const [updating, setUpdating] = useState(false)
  const [showManualSearch, setShowManualSearch] = useState(false)
  const [showManualEdit, setShowManualEdit] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  // Manual search fields
  const [searchTitle, setSearchTitle] = useState(book.title)
  const [searchAuthor, setSearchAuthor] = useState(book.author_name)
  const [searchISBN, setSearchISBN] = useState(book.isbn || '')
  
  // Manual edit fields
  const [editTitle, setEditTitle] = useState(book.title)
  const [editAuthor, setEditAuthor] = useState(book.author_name)
  const [editISBN, setEditISBN] = useState(book.isbn || '')
  const [editPublisher, setEditPublisher] = useState(book.publisher || '')
  const [editPublishedDate, setEditPublishedDate] = useState(book.published_date || '')
  const [editDescription, setEditDescription] = useState(book.description || '')
  const [editPageCount, setEditPageCount] = useState(book.page_count?.toString() || '')
  const [editLanguage, setEditLanguage] = useState(book.language || 'en')
  const [editCategories, setEditCategories] = useState(
    book.categories ? (Array.isArray(book.categories) ? book.categories.join(', ') : book.categories) : ''
  )

  const searchGoogleBooks = async (customQuery?: string) => {
    setSearching(true)
    setSearchResults([])
    // Clear any previous errors
    
    try {
      let query = customQuery
      
      if (!query) {
        // Auto search by title + author
        query = encodeURIComponent(`${book.title} ${book.author_name}`)
      }
      
      console.log('Searching Google Books with query:', query)
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`
      )
      
      if (!response.ok) {
        throw new Error(`Google Books API returned ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('Google Books response:', data)
      
      if (!data.items || data.items.length === 0) {
        setToast({ message: 'No results found. Try refining your search with the Manual Search option.', type: 'info' })
        return
      }
      
      setSearchResults(data.items)
      setSelectedResult(data.items[0]) // Auto-select first result
      
    } catch (err) {
      console.error('Google Books search failed:', err)
      setToast({ message: err instanceof Error ? err.message : 'Failed to search Google Books. Please try again.', type: 'error' })
    } finally {
      setSearching(false)
    }
  }

  const handleManualSearch = () => {
    // Build custom query based on filled fields
    let query = ''
    
    if (searchISBN.trim()) {
      // ISBN search is most accurate
      query = `isbn:${searchISBN.trim()}`
    } else {
      // Build query from title and author
      const parts = []
      if (searchTitle.trim()) {
        parts.push(`intitle:${searchTitle.trim()}`)
      }
      if (searchAuthor.trim()) {
        parts.push(`inauthor:${searchAuthor.trim()}`)
      }
      query = parts.join('+')
    }
    
    if (query) {
      searchGoogleBooks(encodeURIComponent(query))
      setShowManualSearch(false)
    } else {
      setToast({ message: 'Please enter at least one search criteria', type: 'info' })
    }
  }

  const saveManualEdits = async () => {
    setUpdating(true)
    
    try {
      // Prepare update payload from manual edits
      const updateData: any = {}
      
      if (editTitle.trim()) updateData.title = editTitle.trim()
      if (editAuthor.trim()) updateData.author_name = editAuthor.trim()
      if (editISBN.trim()) updateData.isbn = editISBN.trim()
      if (editPublisher.trim()) updateData.publisher = editPublisher.trim()
      if (editPublishedDate.trim()) updateData.published_date = editPublishedDate.trim()
      if (editDescription.trim()) updateData.description = editDescription.trim()
      if (editPageCount.trim()) updateData.page_count = parseInt(editPageCount)
      if (editLanguage.trim()) updateData.language = editLanguage.trim()
      if (editCategories.trim()) {
        // Parse comma-separated categories
        const categories = editCategories.split(',').map(c => c.trim()).filter(Boolean)
        if (categories.length > 0) {
          updateData.categories = categories
        }
      }
      
      console.log('Saving manual edits:', updateData)
      
      // Update book via API
      const response = await fetch(`${API_BASE_URL}/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update book')
      }
      
      const updatedBook = await response.json()
      
      // Notify parent component
      onUpdate?.(updatedBook)
      
      // Show success toast
      setToast({ message: 'Book details updated successfully!', type: 'success' })
      
      // Close modal after short delay
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (err) {
      console.error('Failed to save manual edits:', err)
      setToast({ message: 'Failed to save book details. Please try again.', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const applyMetadata = async () => {
    if (!selectedResult) return
    
    setUpdating(true)
    
    try {
      const volumeInfo = selectedResult.volumeInfo
      
      // Extract ISBN
      const isbn = volumeInfo.industryIdentifiers?.find(
        id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier
      
      // Prepare update payload - only send defined fields
      const updateData: any = {}
      
      if (volumeInfo.title) updateData.title = volumeInfo.title
      if (volumeInfo.authors?.[0]) updateData.author_name = volumeInfo.authors[0]
      if (volumeInfo.description) updateData.description = volumeInfo.description
      if (volumeInfo.publishedDate) updateData.published_date = volumeInfo.publishedDate
      if (volumeInfo.pageCount) updateData.page_count = volumeInfo.pageCount
      if (isbn) updateData.isbn = isbn
      if (volumeInfo.categories && volumeInfo.categories.length > 0) {
        updateData.categories = volumeInfo.categories  // Send as array!
      }
      if (volumeInfo.imageLinks?.thumbnail) {
        updateData.cover_url = volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
      }
      
      console.log('Sending update:', updateData)
      
      // Update book via API
      const response = await fetch(`${API_BASE_URL}/api/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update book')
      }
      
      const updatedBook = await response.json()
      
      // Notify parent component
      onUpdate?.(updatedBook)
      
      // Close modal
      onClose()
      
    } catch (err) {
      console.error('Failed to update book:', err)
      setToast({ message: 'Failed to update book metadata. Please try again.', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Book Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Current Book Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Information
            </h3>
            
            <div className="flex gap-6">
              {/* Cover */}
              <div className="flex-shrink-0">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-32 h-48 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h4>
                <p className="text-morpho-dark dark:text-morpho-light font-semibold mb-2">
                  {book.author_name}
                </p>
                
                {book.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {book.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {book.isbn && (
                    <div>
                      <span className="font-semibold">ISBN:</span> {book.isbn}
                    </div>
                  )}
                  {book.published_date && (
                    <div>
                      <span className="font-semibold">Published:</span>{' '}
                      {new Date(book.published_date).getFullYear()}
                    </div>
                  )}
                  {book.page_count && (
                    <div>
                      <span className="font-semibold">Pages:</span> {book.page_count}
                    </div>
                  )}
                  {book.file_format && (
                    <div>
                      <span className="font-semibold">Format:</span>{' '}
                      <span className="uppercase">{book.file_format}</span>
                    </div>
                  )}
                </div>
                
                {book.categories && book.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {book.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-morpho-primary/20 text-morpho-dark dark:text-morpho-light px-2 py-1 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Books Search */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enrich Metadata from Google Books
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowManualEdit(!showManualEdit)
                    setShowManualSearch(false)
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                >
                  {showManualEdit ? '✖ Cancel' : '✏️ Manual Edit'}
                </button>
                <button
                  onClick={() => {
                    setShowManualSearch(!showManualSearch)
                    setShowManualEdit(false)
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
                >
                  {showManualSearch ? '✖ Cancel' : '🔧 Manual Search'}
                </button>
                <button
                  onClick={() => searchGoogleBooks()}
                  disabled={searching}
                  className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? '🔍 Searching...' : '🔍 Auto Search'}
                </button>
              </div>
            </div>

            {/* Manual Edit Form */}
            {showManualEdit && (
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>✏️</span>
                  <span>Edit Book Details</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Edit any field directly. Perfect for books without ISBN or incomplete metadata.
                </p>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* ISBN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={editISBN}
                      onChange={(e) => setEditISBN(e.target.value)}
                      placeholder="978-0-123456-78-9"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Publisher */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={editPublisher}
                      onChange={(e) => setEditPublisher(e.target.value)}
                      placeholder="Penguin Books"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Published Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Published Date
                    </label>
                    <input
                      type="text"
                      value={editPublishedDate}
                      onChange={(e) => setEditPublishedDate(e.target.value)}
                      placeholder="2024-01-15 or 2024"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Page Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Page Count
                    </label>
                    <input
                      type="number"
                      value={editPageCount}
                      onChange={(e) => setEditPageCount(e.target.value)}
                      placeholder="350"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <input
                      type="text"
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value)}
                      placeholder="en"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categories (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editCategories}
                      onChange={(e) => setEditCategories(e.target.value)}
                      placeholder="Fiction, Mystery, Thriller"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      placeholder="Book description..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Save Button */}
                  <button
                    onClick={saveManualEdits}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? '💾 Saving...' : '💾 Save All Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Manual Search Form */}
            {showManualSearch && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Custom Search
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Fill in any field to refine your search. ISBN is most accurate.
                </p>
                
                <div className="space-y-3">
                  {/* ISBN Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ISBN (10 or 13 digits)
                    </label>
                    <input
                      type="text"
                      value={searchISBN}
                      onChange={(e) => setSearchISBN(e.target.value)}
                      placeholder="978-0-123456-78-9 or 0123456789"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-morpho-primary focus:border-transparent"
                    />
                  </div>
                  
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={searchTitle}
                      onChange={(e) => setSearchTitle(e.target.value)}
                      placeholder="Book title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-morpho-primary focus:border-transparent"
                    />
                  </div>
                  
                  {/* Author Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={searchAuthor}
                      onChange={(e) => setSearchAuthor(e.target.value)}
                      placeholder="Author name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-morpho-primary focus:border-transparent"
                    />
                  </div>
                  
                  {/* Search Button */}
                  <button
                    onClick={handleManualSearch}
                    disabled={searching}
                    className="w-full px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? '🔍 Searching...' : '🔍 Search with Custom Criteria'}
                  </button>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select the best match:
                </p>
                
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedResult?.id === result.id
                        ? 'border-morpho-primary bg-morpho-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-morpho-primary/50'
                    }`}
                  >
                    <div className="flex gap-4">
                      {result.volumeInfo.imageLinks?.thumbnail && (
                        <img
                          src={result.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')}
                          alt={result.volumeInfo.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {result.volumeInfo.title}
                        </h4>
                        <p className="text-sm text-morpho-dark dark:text-morpho-light">
                          {result.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                        </p>
                        {result.volumeInfo.publishedDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Published: {result.volumeInfo.publishedDate}
                          </p>
                        )}
                        {result.volumeInfo.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {result.volumeInfo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          {selectedResult && (
            <button
              onClick={applyMetadata}
              disabled={updating}
              className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : '✨ Apply Metadata'}
            </button>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}