import { useState, useEffect } from 'react'
import { LibraryCreate, Library } from '../types/library'
import { API_BASE_URL } from '../config/api'

interface AddLibraryModalProps {
  library?: Library | null
  onClose: () => void
  onSuccess: () => void
}

export function AddLibraryModal({ library, onClose, onSuccess }: AddLibraryModalProps) {
  const isEditMode = !!library
  
  const [formData, setFormData] = useState<LibraryCreate>({
    name: '',
    path: '',
    library_type: 'books',
    auto_scan: true,
    scan_schedule: 'hourly',
    scan_on_startup: false,
    fetch_metadata: true,
    download_covers: true,
    organize_files: false,
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill form when editing
  useEffect(() => {
    if (library) {
      setFormData({
        name: library.name,
        path: library.path,
        library_type: library.library_type as any,
        auto_scan: library.auto_scan,
        scan_schedule: library.scan_schedule,
        scan_on_startup: library.scan_on_startup || false,
        fetch_metadata: library.fetch_metadata,
        download_covers: library.download_covers,
        organize_files: library.organize_files || false,
      })
    }
  }, [library])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/api/libraries/${library!.id}`
        : `${API_BASE_URL}/api/libraries`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || `Failed to ${isEditMode ? 'update' : 'create'} library`)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? '✏️ Edit Library' : '📚 Add Library'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Library Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Books, Audiobooks, Comics"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-morpho-primary focus:border-transparent"
            />
          </div>

          {/* Path */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Library Path *
            </label>
            <input
              type="text"
              required
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="/books or /mnt/media/books"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-morpho-primary focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The path to your book files on the server
            </p>
          </div>

          {/* Library Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Library Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'books', icon: '📕', label: 'Books', desc: 'epub, mobi, pdf, azw3' },
                { value: 'audiobooks', icon: '🎧', label: 'Audiobooks', desc: 'm4b, mp3, m4a' },
                { value: 'comics', icon: '💥', label: 'Comics', desc: 'cbz, cbr, cb7' },
                { value: 'magazines', icon: '📰', label: 'Magazines', desc: 'pdf, epub' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, library_type: type.value as any })}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.library_type === type.value
                      ? 'border-morpho-primary bg-morpho-primary/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-morpho-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{type.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scan Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Scan Settings
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.auto_scan}
                  onChange={(e) => setFormData({ ...formData, auto_scan: e.target.checked })}
                  className="w-5 h-5 text-morpho-primary focus:ring-morpho-primary rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Auto-scan on folder changes
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically detect new books when files are added
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.scan_on_startup}
                  onChange={(e) => setFormData({ ...formData, scan_on_startup: e.target.checked })}
                  className="w-5 h-5 text-morpho-primary focus:ring-morpho-primary rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Scan on startup
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Scan this library when the app starts
                  </div>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scan Schedule
                </label>
                <select
                  value={formData.scan_schedule}
                  onChange={(e) => setFormData({ ...formData, scan_schedule: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-morpho-primary"
                >
                  <option value="manual">Manual only</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metadata Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Metadata Settings
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fetch_metadata}
                  onChange={(e) => setFormData({ ...formData, fetch_metadata: e.target.checked })}
                  className="w-5 h-5 text-morpho-primary focus:ring-morpho-primary rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Fetch metadata from Google Books
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically fetch book details, descriptions, and more
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.download_covers}
                  onChange={(e) => setFormData({ ...formData, download_covers: e.target.checked })}
                  className="w-5 h-5 text-morpho-primary focus:ring-morpho-primary rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Download missing covers
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically download cover images
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.organize_files}
                  onChange={(e) => setFormData({ ...formData, organize_files: e.target.checked })}
                  className="w-5 h-5 text-morpho-primary focus:ring-morpho-primary rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Organize files by author
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ⚠️ Move files into author/book folders (use with caution)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-morpho-primary hover:bg-morpho-dark text-white'
              }`}
            >
              {loading 
                ? (isEditMode ? 'Updating...' : 'Creating...') 
                : isEditMode 
                  ? 'Update Library' 
                  : (formData.scan_on_startup ? 'Create & Scan' : 'Create Library')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}