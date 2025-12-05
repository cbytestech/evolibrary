export interface Book {
  id: number
  title: string
  author_name: string
  author_id?: number
  isbn?: string
  publisher?: string
  published_date?: string
  description?: string
  cover_url?: string
  language: string
  page_count?: number
  categories: string[]
  created_at: string
  updated_at: string
}

export interface BookListResponse {
  books: Book[]
  total: number
  page: number
  page_size: number
  pages: number
}