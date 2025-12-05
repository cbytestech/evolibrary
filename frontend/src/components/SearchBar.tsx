import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "Search books..." }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4 sm:px-0">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg rounded-lg border-2 border-morpho-primary/30 focus:border-morpho-primary focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-morpho-primary hover:bg-morpho-dark text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 font-semibold text-sm sm:text-base"
        >
          <span className="hidden sm:inline">🔍 Search</span>
          <span className="sm:hidden">🔍</span>
        </button>
      </div>
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('')
            onSearch('')
          }}
          className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-morpho-primary"
        >
          Clear search
        </button>
      )}
    </form>
  )
}