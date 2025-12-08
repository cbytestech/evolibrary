// API Configuration
// Supports different environments (dev, production, docker)

const getApiBaseUrl = (): string => {
  // 1. Check for environment variable (set during build)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // 2. Check if we're in production (on Pi)
  // Frontend is on :3001, backend is on :8001
  if (window.location.port === '3001') {
    return `${window.location.protocol}//${window.location.hostname}:8001`
  }

  // 3. Development fallback
  return 'http://localhost:8000'
}

export const API_BASE_URL = getApiBaseUrl()

// Helper function for making API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, options)
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  
  return response
}