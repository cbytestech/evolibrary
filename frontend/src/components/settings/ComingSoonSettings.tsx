interface ComingSoonSettingsProps {
  sectionName: string
}

export function ComingSoonSettings({ sectionName }: ComingSoonSettingsProps) {
  const getSectionInfo = () => {
    switch (sectionName) {
      case 'indexers':
        return {
          icon: '🔍',
          title: 'Indexers',
          description: 'Configure search providers like MyAnonamouse, LibGen, and more',
          features: [
            'Add multiple indexers',
            'Test connection & authentication',
            'Priority ordering',
            'Search capabilities configuration'
          ]
        }
      case 'download-clients':
        return {
          icon: '⬇️',
          title: 'Download Clients',
          description: 'Manage Deluge, qBittorrent, and other download clients',
          features: [
            'Connect to Deluge/qBittorrent',
            'Auto-labeling for Kavita',
            'Download path configuration',
            'Completed download handling'
          ]
        }
      case 'import-lists':
        return {
          icon: '📥',
          title: 'Import Lists',
          description: 'Automatically import books from curated lists',
          features: [
            'GoodReads lists',
            'Custom RSS feeds',
            'Automatic monitoring',
            'Import scheduling'
          ]
        }
      case 'connect':
        return {
          icon: '🔔',
          title: 'Connect',
          description: 'Notifications and integrations',
          features: [
            'Discord webhooks',
            'Email notifications',
            'Telegram bot',
            'Custom scripts'
          ]
        }
      case 'metadata':
        return {
          icon: '📝',
          title: 'Metadata',
          description: 'Configure metadata sources and preferences',
          features: [
            'Google Books API',
            'OpenLibrary integration',
            'Custom metadata providers',
            'Auto-fetch settings'
          ]
        }
      default:
        return {
          icon: '🚀',
          title: 'Coming Soon',
          description: 'This feature is under development',
          features: []
        }
    }
  }

  const info = getSectionInfo()

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {info.icon} {info.title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {info.description}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-morpho-primary/10 to-morpho-dark/10 dark:from-morpho-primary/20 dark:to-morpho-dark/20 rounded-lg border-2 border-dashed border-morpho-primary/30 p-8 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Coming in Phase 2!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This feature is currently under development
        </p>

        {/* Planned Features */}
        {info.features.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              📋 Planned Features:
            </h3>
            <ul className="text-left space-y-2">
              {info.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-morpho-primary mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress */}
        <div className="mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Development Progress
          </div>
          <div className="max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-morpho-primary h-3 rounded-full" style={{ width: '25%' }}></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Phase 1: Core Features ✅ | Phase 2: Integrations 🚧
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex gap-2">
          <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Want to help?</strong> Check out our GitHub repository to contribute or request features!
          </div>
        </div>
      </div>
    </div>
  )
}