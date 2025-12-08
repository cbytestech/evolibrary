// Library types and interfaces

export interface Library {
  id: number
  name: string
  path: string
  library_type: 'books' | 'audiobooks' | 'comics' | 'magazines'
  enabled: boolean
  auto_scan: boolean
  scan_schedule: string
  last_scan: string | null
  scan_on_startup: boolean
  fetch_metadata: boolean
  download_covers: boolean
  organize_files: boolean
  total_items: number
  total_size: number
  created_at: string
  updated_at: string
  scan_progress?: ScanProgress
}

export interface ScanProgress {
  status: 'idle' | 'scanning' | 'complete' | 'failed'
  progress: number
  total_files: number
  processed: number
  added: number
  updated: number
  duplicates: number
  errors: number
  started_at?: string
  completed_at?: string
  failed_at?: string
  eta_seconds?: number
  error?: string
}

export interface LibraryStats {
  library_id: number
  library_name: string
  total_books: number
  total_authors: number
  total_size_bytes: number
  total_size_mb: number
  avg_file_size_mb: number
  oldest_book_added: string | null
  newest_book_added: string | null
  formats: Record<string, number>
  last_scan: string | null
}

export interface LibraryCreate {
  name: string
  path: string
  library_type: 'books' | 'audiobooks' | 'comics' | 'magazines'
  auto_scan?: boolean
  scan_schedule?: string
  scan_on_startup?: boolean
  fetch_metadata?: boolean
  download_covers?: boolean
  organize_files?: boolean
}

export interface LibraryUpdate {
  name?: string
  path?: string
  library_type?: 'books' | 'audiobooks' | 'comics' | 'magazines'
  enabled?: boolean
  auto_scan?: boolean
  scan_schedule?: string
  scan_on_startup?: boolean
  fetch_metadata?: boolean
  download_covers?: boolean
  organize_files?: boolean
}