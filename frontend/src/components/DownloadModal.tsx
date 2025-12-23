// File: frontend/src/components/DownloadModal.tsx

import { useState } from 'react'

interface DownloadModalProps {
  result: {
    title: string
    size_mb: number
    seeders: number
    indexer_name: string
    download_url: string
    file_format?: string | null
  }
  onConfirm: (mediaType: string) => void
  onCancel: () => void
}

interface LibraryType {
  id: string
  label: string
  icon: string
  deluge_label: string
  path: string
  description: string
}

const LIBRARY_TYPES: LibraryType[] = [
  { 
    id: 'comic', 
    label: 'Comics', 
    icon: '🦸',
    deluge_label: 'comics',
    path: '/downloads/comics',
    description: 'CBZ, CBR, CB7 files'
  },
  { 
    id: 'ebook', 
    label: 'Books', 
    icon: '📖',
    deluge_label: 'ebooks',
    path: '/downloads/ebooks',
    description: 'EPUB, MOBI, AZW3, PDF'
  },
  { 
    id: 'audiobook', 
    label: 'Audiobooks', 
    icon: '🎧',
    deluge_label: 'audiobooks',
    path: '/downloads/audiobooks',
    description: 'M4B, MP3, AAC, FLAC'
  },
  { 
    id: 'magazine', 
    label: 'Magazines', 
    icon: '📰',
    deluge_label: 'magazines',
    path: '/downloads/magazines',
    description: 'PDF periodicals'
  }
]

export function DownloadModal({ result, onConfirm, onCancel }: DownloadModalProps) {
  // Smart default selection based on filename
  const guessType = (): string => {
    const title = result.title.toLowerCase()
    const format = result.file_format?.toLowerCase() || ''
    
    // Check file format first
    if (['cbz', 'cbr', 'cb7', 'cbt'].includes(format)) return 'comic'
    if (['m4b', 'mp3', 'aac', 'flac', 'ogg'].includes(format)) return 'audiobook'
    if (format === 'pdf' && (title.includes('magazine') || title.includes('monthly'))) return 'magazine'
    if (['epub', 'mobi', 'azw3', 'pdf'].includes(format)) return 'ebook'
    
    // Fallback to keyword matching in title
    if (title.includes('cbz') || title.includes('cbr') || title.includes('comic') || title.includes('manga')) return 'comic'
    if (title.includes('m4b') || title.includes('mp3') || title.includes('audiobook')) return 'audiobook'
    if (title.includes('magazine') || title.includes('monthly') || title.includes('weekly')) return 'magazine'
    
    // Default to ebook
    return 'ebook'
  }

  const [selectedType, setSelectedType] = useState(guessType())
  const selectedLibrary = LIBRARY_TYPES.find(t => t.id === selectedType)!

  const formatSize = (mb: number): string => {
    if (mb < 1) return `${Math.round(mb * 1024)} KB`
    if (mb < 1024) return `${mb.toFixed(1)} MB`
    return `${(mb / 1024).toFixed(2)} GB`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm(selectedType)
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📥 Download to Library
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* File Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {result.title}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>📦 {formatSize(result.size_mb)}</span>
              <span>🌱 {result.seeders} seeds</span>
              <span>🔗 {result.indexer_name}</span>
              {result.file_format && (
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">
                  {result.file_format.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Library Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              📁 Select Library Type:
            </label>
            <div className="space-y-2">
              {LIBRARY_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedType === type.id
                      ? 'border-morpho-primary bg-morpho-primary/10 dark:bg-morpho-primary/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-morpho-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {type.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </div>
                    </div>
                    {selectedType === type.id && (
                      <span className="text-morpho-primary text-2xl">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💾 This will:
            </div>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
              <li>• Download to: <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded font-mono text-xs">{selectedLibrary.path}</code></li>
              <li>• Apply Deluge label: <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded font-mono text-xs">{selectedLibrary.deluge_label}</code></li>
              <li>• Track in EvoLibrary under {selectedLibrary.label}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedType)}
            className="flex-1 px-6 py-3 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors shadow-lg"
          >
            📥 Download to {selectedLibrary.label}
          </button>
        </div>
      </div>
    </div>
  )
}