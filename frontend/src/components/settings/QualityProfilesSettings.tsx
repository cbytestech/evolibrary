// File: frontend/src/components/settings/QualityProfilesSettings.tsx

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config/api'

interface FormatItem {
  format: string
  priority: number
  min_size_mb: number
  max_size_mb: number
  enabled: boolean
}

interface QualityProfile {
  id: number
  name: string
  description: string | null
  format_items: FormatItem[]
  cutoff_format: string | null
  allow_upgrades: boolean
  upgrade_until_cutoff: boolean
  media_type: string
  enabled: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export function QualityProfilesSettings() {
  const [profiles, setProfiles] = useState<QualityProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedProfile, setExpandedProfile] = useState<number | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/quality-profiles`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch quality profiles')
      }

      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching profiles:', err)
    } finally {
      setLoading(false)
    }
  }

  const seedDefaults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quality-profiles/seed-defaults`, {
        method: 'POST'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to seed profiles')
      }

      await fetchProfiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed defaults')
    }
  }

  const toggleDefault = async (profileId: number) => {
    try {
      const profile = profiles.find(p => p.id === profileId)
      if (!profile) return

      const response = await fetch(`${API_BASE_URL}/api/quality-profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_default: !profile.is_default
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      await fetchProfiles()
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  const toggleEnabled = async (profileId: number) => {
    try {
      const profile = profiles.find(p => p.id === profileId)
      if (!profile) return

      const response = await fetch(`${API_BASE_URL}/api/quality-profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !profile.enabled
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      await fetchProfiles()
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'ebook': return '📕'
      case 'audiobook': return '🎧'
      case 'comic': return '💥'
      case 'magazine': return '📰'
      default: return '📚'
    }
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          ⚙️ Quality Profiles
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define format preferences and download rules for different media types
        </p>
      </div>

      {/* Seed Defaults Button */}
      {profiles.length === 0 && !loading && (
        <div className="mb-6">
          <button
            onClick={seedDefaults}
            className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
          >
            🌱 Create Default Profiles
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-morpho-primary border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Profiles List */}
      {!loading && profiles.length > 0 && (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div 
              key={profile.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Profile Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMediaIcon(profile.media_type)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {profile.name}
                        {profile.is_default && (
                          <span className="text-xs bg-morpho-primary text-white px-2 py-1 rounded">
                            DEFAULT
                          </span>
                        )}
                        {!profile.enabled && (
                          <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">
                            DISABLED
                          </span>
                        )}
                      </h3>
                      {profile.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {profile.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEnabled(profile.id)}
                      className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                        profile.enabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {profile.enabled ? '✓ Enabled' : '○ Disabled'}
                    </button>

                    {!profile.is_default && (
                      <button
                        onClick={() => toggleDefault(profile.id)}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Set as Default
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedProfile(expandedProfile === profile.id ? null : profile.id)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {expandedProfile === profile.id ? '▲ Hide' : '▼ Details'}
                    </button>
                  </div>
                </div>

                {/* Format Priority Preview */}
                <div className="flex flex-wrap gap-2">
                  {profile.format_items
                    .filter(item => item.enabled)
                    .sort((a, b) => a.priority - b.priority)
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          profile.cutoff_format === item.format
                            ? 'bg-morpho-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        #{item.priority} {item.format.toUpperCase()}
                        {profile.cutoff_format === item.format && ' ⭐'}
                      </div>
                    ))}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedProfile === profile.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                    Format Preferences (Priority Order)
                  </h4>
                  
                  <div className="space-y-2">
                    {profile.format_items
                      .sort((a, b) => a.priority - b.priority)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg ${
                            item.enabled
                              ? 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                              : 'bg-gray-100 dark:bg-gray-800/50 border-2 border-gray-300 dark:border-gray-600 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-2xl font-bold text-morpho-primary">
                                #{item.priority}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {item.format.toUpperCase()}
                                  {profile.cutoff_format === item.format && (
                                    <span className="ml-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                                      ⭐ Cutoff
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Size: {item.min_size_mb > 0 ? `${item.min_size_mb}MB` : '0'} - {item.max_size_mb > 0 ? `${item.max_size_mb}MB` : 'No limit'}
                                </div>
                              </div>
                            </div>
                            <div>
                              {item.enabled ? (
                                <span className="text-green-600 dark:text-green-400 font-semibold">
                                  ✓ Enabled
                                </span>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">
                                  ○ Disabled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Additional Settings */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Allow Upgrades
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {profile.allow_upgrades ? '✓ Yes' : '✗ No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Upgrade Until Cutoff
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {profile.upgrade_until_cutoff ? '✓ Yes' : '✗ No'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex gap-2">
          <span className="text-blue-600 dark:text-blue-400">💡</span>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <strong>How it works:</strong> Quality profiles define which file formats to accept and prefer. 
            When searching, the system will try to find books matching your format preferences in priority order. 
            If "Cutoff" is set, searching stops once that format is found.
          </div>
        </div>
      </div>
    </div>
  )
}