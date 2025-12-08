import { useEffect, useState } from 'react'
import { Library, LibraryStats } from '../types/library'
import { API_BASE_URL } from '../config/api'

interface LibraryCardProps {
  library: Library
  stats?: LibraryStats
  onScan: () => void
  onEdit: (library: Library) => void
  onDelete: () => void
  onRefresh: () => void
}

export function LibraryCard({ 
  library, 
  stats,
  onScan, 
  onEdit, 
  onDelete,
  onRefresh 
}: LibraryCardProps) {
  const [scanProgress, setScanProgress] = useState(library.scan_progress)
  const [polling, setPolling] = useState(false)

  // Poll for scan progress if scanning
  useEffect(() => {
    if (library.scan_progress?.status === 'scanning') {
      setPolling(true)
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/libraries/${library.id}/scan/status`
          )
          if (response.ok) {
            const data = await response.json()
            setScanProgress(data)
            
            // Stop polling if complete
            if (data.status !== 'scanning') {
              setPolling(false)
              onRefresh()
            }
          }
        } catch (err) {
          console.error('Failed to fetch scan status:', err)
        }
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setPolling(false)
    }
  }, [library.scan_progress?.status, library.id, onRefresh])

  const isScanning = scanProgress?.status === 'scanning'
  const progress = scanProgress?.progress || 0

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatETA = (seconds: number | null | undefined) => {
    if (!seconds) return null
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const getLibraryIcon = () => {
    switch (library.library_type) {
      case 'audiobooks': return '🎧'
      case 'comics': return '💥'
      case 'magazines': return '📰'
      default: return '📕'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{getLibraryIcon()}</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {library.name}
            </h3>
            {!library.enabled && (
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded">
                Disabled
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {library.path}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Books:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {library.total_items}
          </span>
        </div>
        
        {stats && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Authors:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.total_authors}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Size:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.total_size_mb.toFixed(2)} MB
              </span>
            </div>

            {/* Format breakdown */}
            {Object.keys(stats.formats).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Formats:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.formats).map(([format, count]) => (
                    <span 
                      key={format}
                      className="px-2 py-1 bg-morpho-primary/10 text-morpho-primary text-xs rounded"
                    >
                      .{format}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Last Scan:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatDate(library.last_scan)}
          </span>
        </div>

        {library.auto_scan && (
          <div className="flex items-center gap-2 text-sm text-morpho-primary">
            <span>🔄</span>
            <span>Auto-scan enabled ({library.scan_schedule})</span>
          </div>
        )}
      </div>

      {/* Scan Progress */}
      {isScanning && scanProgress && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Scanning... {progress}%
            </span>
            {scanProgress.eta_seconds && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                ETA: {formatETA(scanProgress.eta_seconds)}
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-morpho-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
            <span>
              {scanProgress.processed} / {scanProgress.total_files} files
            </span>
            <span>
              +{scanProgress.added} | ↻{scanProgress.updated} | ⚠{scanProgress.errors}
            </span>
          </div>

          {/* 🎁 Show duplicates found */}
          {scanProgress.duplicates > 0 && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              🎁 Found {scanProgress.duplicates} duplicate{scanProgress.duplicates !== 1 ? 's' : ''} (skipped)
            </div>
          )}
        </div>
      )}

      {/* Scan Complete Message */}
      {scanProgress?.status === 'complete' && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
            ✅ Scan Complete!
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Added: {scanProgress.added}, Updated: {scanProgress.updated}, 
            Duplicates: {scanProgress.duplicates}, Errors: {scanProgress.errors}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onScan}
          disabled={isScanning}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
            isScanning
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-morpho-primary hover:bg-morpho-dark text-white'
          }`}
        >
          {isScanning ? 'Scanning...' : '🔍 Scan Now'}
        </button>
        
        <button
          onClick={() => onEdit(library)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
        >
          ⚙️
        </button>
        
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-semibold transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}