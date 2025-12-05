import { useState } from 'react'
import { BooksPage } from './pages/BooksPage'
import { Header } from './components/Header'

type Page = 'home' | 'books'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const saved = localStorage.getItem('theme') || 'morpho'
    if (saved === 'homestead-light' || saved === 'homestead-dark') {
      return 'homestead'
    }
    return saved
  })

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
  }

  // Theme-based background classes
  const getBackgroundClass = () => {
    if (currentTheme === 'homestead') {
      return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-amber-950'
    }
    // Default: Morpho theme
    return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
  }

  if (currentPage === 'books') {
    return <BooksPage onNavigate={handleNavigate} currentTheme={currentTheme} onThemeChange={handleThemeChange} />
  }

  return (
    <>
      <Header onNavigate={handleNavigate} currentPage={currentPage} onThemeChange={handleThemeChange} />
      <div className={`min-h-screen ${getBackgroundClass()} pt-24`}>
        <div className="container mx-auto px-4 py-12 sm:py-16">
        
        {/* Main Action Card */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 border-2 border-morpho-primary">
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">
              Welcome to Your Library
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Your digital book collection is ready to explore!
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setCurrentPage('books')}
              className="w-full py-3 sm:py-4 bg-morpho-primary hover:bg-morpho-dark text-white text-lg sm:text-xl font-bold rounded-lg transition-colors duration-200 shadow-lg"
            >
              📖 Browse Books
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 text-center text-sm sm:text-base"
              >
                📚 API Docs
              </a>
              <a
                href="/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200 text-center text-sm sm:text-base"
              >
                💚 Health Check
              </a>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-lg border border-morpho-primary/30">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔍</div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-gray-100">
              Search
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Find books by title, author, or category
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-lg border border-morpho-primary/30">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📊</div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-gray-100">
              Organize
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Track your reading and organize your collection
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-lg shadow-lg border border-morpho-primary/30">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🦠</div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-gray-100">
              Evolve
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Your library that grows and adapts with you
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="max-w-2xl mx-auto mt-6 sm:mt-8 text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          <p className="mb-2">
            🚀 <strong>Frontend:</strong> React + TypeScript + Tailwind CSS
          </p>
          <p>
            🔧 <strong>Backend:</strong> FastAPI + SQLAlchemy + SQLite
          </p>
        </div>
      </div>
      </div>
    </>
  )
}

export default App