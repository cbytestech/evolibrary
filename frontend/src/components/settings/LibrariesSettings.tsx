import { useEffect, useState } from 'react'
import { Library, LibraryStats } from '../../types/library'
import { LibraryCard } from '../LibraryCard'
import { AddLibraryModal } from '../AddLibraryModal'
import { API_BASE_URL } from '../../config/api'

export function LibrariesSettings() {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
  
  // 🎁 SECRET FEATURE #3: Library statistics dashboard
  const [stats, setStats] = useState<Record<number, LibraryStats>>({})
  const [showStats, setShowStats] = useState(false)

  const fetchLibraries = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/libraries`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch libraries')
      }

      const data = await response.json()
      setLibraries(data.libraries || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching libraries:', err)
    } finally {
      setLoading(false)
    }
  }

  // 🎁 SECRET FEATURE #3: Fetch stats for all libraries
  const fetchAllStats = async () => {
    const statsPromises = libraries.map(async (lib) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/libraries/${lib.id}/stats`)
        if (response.ok) {
          const data = await response.json()
          return { id: lib.id, stats: data }
        }
      } catch (err) {
        console.error(`Failed to fetch stats for library ${lib.id}`)
      }
      return null
    })

    const results = await Promise.all(statsPromises)
    const statsMap: Record<number, LibraryStats> = {}
    
    results.forEach(result => {
      if (result) {
        statsMap[result.id] = result.stats
      }
    })

    setStats(statsMap)
  }

  useEffect(() => {
    fetchLibraries()
  }, [])

  useEffect(() => {
    if (libraries.length > 0 && showStats) {
      fetchAllStats()
    }
  }, [libraries, showStats])

  const handleScan = async (libraryId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/libraries/${libraryId}/scan`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Failed to start scan')
      }

      setTimeout(() => fetchLibraries(), 1000)
    } catch (err) {
      console.error('Scan failed:', err)
      alert('Failed to start scan')
    }
  }

  const handleDelete = async (libraryId: number) => {
    if (!confirm('Are you sure you want to delete this library?')) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/libraries/${libraryId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete library')
      }

      await fetchLibraries()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete library')
    }
  }

  const handleLibraryAdded = () => {
    setShowAddModal(false)
    setSelectedLibrary(null)
    fetchLibraries()
  }

  const handleEdit = (library: Library) => {
    setSelectedLibrary(library)
    setShowAddModal(true)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setSelectedLibrary(null)
  }

  // 🎁 SECRET FEATURE #3: Calculate total stats
  const totalStats = {
    totalBooks: libraries.reduce((sum, lib) => sum + lib.total_items, 0),
    totalSize: libraries.reduce((sum, lib) => sum + lib.total_size, 0),
    totalLibraries: libraries.length,
    enabledLibraries: libraries.filter(lib => lib.enabled).length
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            📚 Libraries
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your book collections and scan settings
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors shadow-lg"
        >
          + Add Library
        </button>
      </div>

      {/* Stats Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowStats(!showStats)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showStats 
              ? 'bg-morpho-primary text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          📊 {showStats ? 'Hide' : 'Show'} Statistics
        </button>
      </div>

      {/* Overall Stats */}
      {showStats && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📈 Overall Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-morpho-primary">
                {totalStats.totalLibraries}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total Libraries
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-morpho-primary">
                {totalStats.totalBooks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total Books
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-morpho-primary">
                {(totalStats.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Total Size
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-morpho-primary">
                {totalStats.enabledLibraries}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-morpho-primary border-t-transparent"></div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && libraries.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <div className="text-5xl mb-3">📚</div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
            No Libraries Yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Add your first library to start organizing your books!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
          >
            + Add Library
          </button>
        </div>
      )}

      {/* Libraries Grid */}
      {!loading && !error && libraries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {libraries.map((library) => (
            <LibraryCard
              key={library.id}
              library={library}
              stats={showStats ? stats[library.id] : undefined}
              onScan={() => handleScan(library.id)}
              onEdit={handleEdit}
              onDelete={() => handleDelete(library.id)}
              onRefresh={fetchLibraries}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddLibraryModal
          library={selectedLibrary}
          onClose={handleCloseModal}
          onSuccess={handleLibraryAdded}
        />
      )}
    </div>
  )
}