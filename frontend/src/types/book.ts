// File: frontend/src/types/book.ts

export interface Book {
  id: number
  title: string
  author_name: string | null  // Can be null from API
  author_id?: number
  isbn?: string | null
  publisher?: string | null
  published_date?: string | null
  description?: string | null
  cover_url?: string | null
  language?: string | null  // Optional and nullable
  page_count?: number
  categories?: string[]  // Optional
  created_at?: string  // Optional
  updated_at?: string  // Optional
  file_path?: string  // File path on disk
  media_type?: string  // ebook, audiobook, comic, magazine
  file_format?: string  // ADDED: epub, mobi, pdf, m4b, etc.
  status?: string  // available, monitoring, requesting, downloading
  monitored?: boolean  // Is this book being monitored for downloads
  file_size?: number  // File size in bytes
}

export interface BookListResponse {
  books: Book[]
  total: number
  page: number
  page_size: number
  pages: number
}