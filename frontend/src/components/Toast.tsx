// File: frontend/src/components/Toast.tsx
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`${getStyles()} rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 max-w-md`}>
        <span className="text-2xl">{getIcon()}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
    </div>
  )
}