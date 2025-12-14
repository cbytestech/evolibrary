import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

interface HomePageProps {
  onNavigate?: (page: 'home' | 'library' | 'settings') => void
  onNavigateToLogs?: () => void
  currentTheme?: string
  onThemeChange?: (theme: string) => void
}

export function HomePage({ onNavigate, onNavigateToLogs, currentTheme = 'morpho', onThemeChange }: HomePageProps) {
  const getBackgroundClass = () => {
    if (currentTheme === 'homestead') {
      return 'bg-amber-50 dark:bg-gradient-to-br dark:from-amber-950 dark:via-orange-950 dark:to-amber-950'
    }
    return 'bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950 dark:to-gray-900'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} currentPage="home" onThemeChange={onThemeChange} />
      
      <main className={`flex-1 ${getBackgroundClass()} pt-24`}>
        <div className="container mx-auto px-4 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="text-8xl mb-6">🦋</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Evolibrary
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Your self-hosted library manager
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            <button
              onClick={() => onNavigate?.('library')}
              className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Browse Library
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View your collection
              </p>
            </button>

            <button
              onClick={() => onNavigate?.('settings')}
              className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage libraries
              </p>
            </button>

            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Statistics
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Coming soon...
              </p>
            </div>

          </div>

          {/* Getting Started */}
          <div className="max-w-2xl mx-auto mt-16 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Getting Started
            </h2>
            <ol className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex gap-3">
                <span className="font-bold text-morpho-primary">1.</span>
                <span>Go to <strong>Settings</strong> and add a library</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-morpho-primary">2.</span>
                <span>Point it to your book folder</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-morpho-primary">3.</span>
                <span>Click <strong>Scan Now</strong> to import your books</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-morpho-primary">4.</span>
                <span>Browse your collection!</span>
              </li>
            </ol>
          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} onNavigateToLogs={onNavigateToLogs} />
    </div>
  )
}