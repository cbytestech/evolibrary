import { ReactNode } from 'react'

interface SettingsLayoutProps {
  children: ReactNode
  currentSection: string
  onSectionChange: (section: string) => void
}

export function SettingsLayout({ children, currentSection, onSectionChange }: SettingsLayoutProps) {
  const sections = [
    { id: 'libraries', icon: '📚', label: 'Libraries', description: 'Manage book collections' },
    { id: 'ui', icon: '🎨', label: 'UI', description: 'Themes and appearance' },
    { id: 'indexers', icon: '🔍', label: 'Indexers', description: 'Search providers', badge: 'Soon' },
    { id: 'download-clients', icon: '⬇️', label: 'Download Clients', description: 'Deluge, qBittorrent', badge: 'Soon' },
    { id: 'import-lists', icon: '📥', label: 'Import Lists', description: 'Auto-import from lists', badge: 'Soon' },
    { id: 'connect', icon: '🔔', label: 'Connect', description: 'Notifications & webhooks', badge: 'Soon' },
    { id: 'metadata', icon: '📝', label: 'Metadata', description: 'Google Books & sources', badge: 'Soon' },
    { id: 'logging', icon: '📊', label: 'Logging', description: 'Log levels and files' },
    { id: 'health', icon: '🏥', label: 'Health', description: 'System diagnostics' },
    { id: 'general', icon: '⚡', label: 'General', description: 'Port, auth, updates' },
  ]

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            ⚙️ Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure Evolibrary
          </p>
        </div>

        <nav className="px-2 pb-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all group ${
                currentSection === section.id
                  ? 'bg-morpho-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">{section.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{section.label}</div>
                    <div className={`text-xs truncate ${
                      currentSection === section.id
                        ? 'text-white/80'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {section.description}
                    </div>
                  </div>
                </div>
                {section.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    currentSection === section.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {section.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}