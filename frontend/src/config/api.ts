// frontend/src/config/api.ts

const getApiBaseUrl = (): string => {
  // Always use the same hostname as the frontend, just change the port to 8001
  // This works for:
  // - http://10.0.0.50:3001 → http://10.0.0.50:8001
  // - http://displaypotato.duckdns.org:3001 → http://displaypotato.duckdns.org:8001
  // - http://localhost:3001 → http://localhost:8001
  
  return `${window.location.protocol}//${window.location.hostname}:8001`
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