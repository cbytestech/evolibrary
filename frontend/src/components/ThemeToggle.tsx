import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check initial state
    const savedMode = localStorage.getItem('darkMode')
    const isDark = savedMode === 'true' || 
                   (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
    
    // Apply immediately
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDark = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    
    // Update HTML element
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save preference
    localStorage.setItem('darkMode', newMode.toString())
    
    // Debug log
    console.log('Dark mode:', newMode)
    console.log('HTML classes:', document.documentElement.className)
  }

  const buttonStyle = {
    position: 'fixed' as const,
    top: '1rem',
    right: '1rem',
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    border: '2px solid #14b8a6',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    zIndex: 9999,
    transition: 'all 0.2s ease',
  }

  return (
    <button
      onClick={toggleDark}
      style={buttonStyle}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  )
}