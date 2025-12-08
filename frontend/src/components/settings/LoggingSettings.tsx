import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../../config/api'

export function LoggingSettings() {
  const [logLevel, setLogLevel] = useState('INFO')
  const [logs, setLogs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [command, setCommand] = useState('')
  const [commandOutput, setCommandOutput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Load saved log level
  useEffect(() => {
    const saved = localStorage.getItem('logLevel')
    if (saved) {
      setLogLevel(saved)
    }
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current && isStreaming) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isStreaming])

  const handleLogLevelChange = async (level: string) => {
    setLogLevel(level)
    localStorage.setItem('logLevel', level)
    
    // TODO: Send to backend API to actually change log level
    // For now, just save to localStorage
    console.log(`Log level changed to: ${level}`)
  }

  const startLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setIsStreaming(true)
    setLogs([])

    // SSE endpoint for streaming logs
    const eventSource = new EventSource(`${API_BASE_URL}/api/admin/logs/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      setLogs(prev => [...prev.slice(-500), event.data]) // Keep last 500 lines
    }

    eventSource.onerror = () => {
      console.error('Log stream error')
      stopLogStream()
    }
  }

  const stopLogStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evolibrary-logs-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const executeCommand = async () => {
    if (!command.trim()) return

    setIsExecuting(true)
    setCommandOutput('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim() })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCommandOutput(data.output || data.stdout || 'Command executed successfully')
      } else {
        setCommandOutput(`Error: ${data.error || 'Command failed'}`)
      }
    } catch (err) {
      setCommandOutput(`Error: ${err instanceof Error ? err.message : 'Failed to execute command'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Logging & Terminal
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View live logs, execute commands, and configure logging verbosity
        </p>
      </div>

      {/* Live Log Viewer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            📋 Live Log Stream
          </h3>
          <div className="flex gap-2">
            {!isStreaming ? (
              <button
                onClick={startLogStream}
                className="px-4 py-2 bg-morpho-primary hover:bg-morpho-dark text-white rounded-lg font-semibold transition-colors"
              >
                ▶️ Start Stream
              </button>
            ) : (
              <button
                onClick={stopLogStream}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                ⏸️ Stop Stream
              </button>
            )}
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              🗑️ Clear
            </button>
            <button
              onClick={downloadLogs}
              disabled={logs.length === 0}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              💾 Download
            </button>
          </div>
        </div>

        {/* Log Output - Fixed height, no page scroll */}
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-green-400">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {isStreaming ? 'Waiting for logs...' : 'Click "Start Stream" to view live logs'}
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Container Terminal - Right below logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          💻 Container Terminal
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Execute commands inside the Evolibrary container (use with caution!)
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
              placeholder="Enter command (e.g., ls -la, cat /config/evolibrary.db)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isExecuting}
            />
            <button
              onClick={executeCommand}
              disabled={isExecuting || !command.trim()}
              className="px-6 py-2 bg-morpho-primary hover:bg-morpho-dark disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              {isExecuting ? '⏳ Running...' : '▶️ Execute'}
            </button>
          </div>

          {/* Command Output - Fixed height */}
          {commandOutput && (
            <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs text-green-400 whitespace-pre-wrap">
              {commandOutput}
            </div>
          )}

          {/* Quick Commands */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCommand('ls -la /config')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs font-semibold"
            >
              📁 List Config
            </button>
            <button
              onClick={() => setCommand('du -sh /books')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs font-semibold"
            >
              📊 Books Size
            </button>
            <button
              onClick={() => setCommand('ps aux')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs font-semibold"
            >
              🔍 Processes
            </button>
            <button
              onClick={() => setCommand('tail -n 50 /app/logs/evolibrary.log')}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-xs font-semibold"
            >
              📋 Last 50 Logs
            </button>
          </div>
        </div>
      </div>

      {/* Log Level Settings - At bottom */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Log Level
          </h3>
          <div className="flex items-center gap-2">
            {showSaved && (
              <span className="text-sm text-morpho-primary font-semibold animate-fade-out">
                ✅ Saved!
              </span>
            )}
            <button
              onClick={() => {
                localStorage.setItem('logLevel', logLevel)
                setShowSaved(true)
                setTimeout(() => setShowSaved(false), 2000)
              }}
              className="px-3 py-1 bg-morpho-primary hover:bg-morpho-dark text-white rounded font-semibold transition-colors text-sm"
            >
              💾 Save
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {[
            { level: 'DEBUG', desc: 'Verbose (may impact performance)' },
            { level: 'INFO', desc: 'General information' },
            { level: 'WARNING', desc: 'Potential issues' },
            { level: 'ERROR', desc: 'Only errors (production)' }
          ].map(({ level, desc }) => (
            <label
              key={level}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
              style={{
                borderColor: logLevel === level ? 'var(--color-morpho-primary)' : '#e5e7eb',
                backgroundColor: logLevel === level ? 'rgba(52, 211, 153, 0.1)' : 'transparent'
              }}
            >
              <input
                type="radio"
                name="logLevel"
                value={level}
                checked={logLevel === level}
                onChange={(e) => setLogLevel(e.target.value)}
              />
              <div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  {level}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {desc}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

    </div>
  )
}