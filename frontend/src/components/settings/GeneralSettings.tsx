export function GeneralSettings() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          ⚡ General
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Port, authentication, and update settings
        </p>
      </div>

      {/* Server Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Server Configuration
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backend Port
            </label>
            <input
              type="number"
              defaultValue="8000"
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Configured in docker-compose.yml
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frontend Port
            </label>
            <input
              type="number"
              defaultValue="3000"
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Configured in docker-compose.yml
            </p>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          🔒 Authentication
        </h2>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex gap-2">
            <span className="text-blue-600 dark:text-blue-400">💡</span>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Authentication system coming in Phase 2! Currently running in open mode.
            </div>
          </div>
        </div>
      </div>

      {/* Updates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📦 Updates
        </h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              Current Version
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              v0.1.0
            </div>
          </div>
          <button className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors">
            Check for Updates
          </button>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <div className="text-sm text-green-600 dark:text-green-400">
              You're running the latest version!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}