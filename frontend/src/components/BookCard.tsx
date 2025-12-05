import { Book } from '../types/book'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Book Cover */}
      <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-morpho-primary/10 to-morpho-dark/10 flex items-center justify-center flex-shrink-0">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="max-w-full max-h-full object-contain p-3 sm:p-4"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-xs sm:text-sm text-morpho-dark dark:text-morpho-light font-semibold mb-2">
          {book.author_name}
        </p>

        {/* Description */}
        {book.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3 flex-grow">
            {book.description}
          </p>
        )}

        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
            {book.categories.slice(0, 3).map((category, idx) => (
              <span
                key={idx}
                className="text-xs bg-morpho-primary/20 text-morpho-dark dark:text-morpho-light px-2 py-0.5 sm:py-1 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div>
            {book.page_count && (
              <span>{book.page_count} pages</span>
            )}
          </div>
          <div>
            {book.published_date && (
              <span>{new Date(book.published_date).getFullYear()}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button className="mt-2 sm:mt-3 w-full bg-morpho-primary hover:bg-morpho-dark text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
          View Details
        </button>
      </div>
    </div>
  )
}