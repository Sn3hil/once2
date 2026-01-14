import { useState } from 'react'
import './index.css'
import type { ActionType, DebugEntry, WSMessage } from './types'
import { ActionPicker } from './components/ActionPicker'
import { ActionForm } from './components/ActionForm'
import { DebugPanel } from './components/DebugPanel'
import { ResponsePanel } from './components/ResponsePanel'

function App() {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<unknown>(null)
  const [debugEntries, setDebugEntries] = useState<DebugEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  const connect = () => {
    const socket = new WebSocket('ws://localhost:4000/ws')

    socket.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    socket.onmessage = (event) => {
      const data: WSMessage = JSON.parse(event.data)

      if (data.type === 'connected') {
        console.log('Debug API connected')
      } else if (data.type === 'result') {
        setResponse(data.res || data.resCont)
        setDebugEntries(data.debug || [])
        setIsLoading(false)
      } else if (data.type === 'error') {
        setError(data.message || 'Unknown error')
        setIsLoading(false)
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
      setWs(null)
    }

    socket.onerror = () => {
      setError('WebSocket connection failed')
      setIsConnected(false)
    }

    setWs(socket)
  }

  const executeAction = (params: Record<string, unknown>) => {
    if (!ws || !selectedAction) return

    setIsLoading(true)
    setError(null)
    setResponse(null)
    setDebugEntries([])

    ws.send(JSON.stringify({
      action: selectedAction,
      params
    }))
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Once DevTool</h1>
        <button
          onClick={connect}
          disabled={isConnected}
          className={cn(
            "px-4 py-2 rounded text-sm",
            isConnected
              ? "bg-success/20 text-success cursor-default"
              : "bg-accent text-white hover:bg-accent/80"
          )}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </button>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-error/20 border border-error/50 rounded text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[300px_1fr] gap-6 h-[calc(100vh-100px)]">
        <div className="space-y-4 overflow-y-auto">
          <ActionPicker
            selected={selectedAction}
            onSelect={setSelectedAction}
            disabled={!isConnected}
          />

          {selectedAction && (
            <ActionForm
              action={selectedAction}
              onSubmit={executeAction}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="space-y-4">
          <DebugPanel entries={debugEntries} />
          <ResponsePanel response={response} />
        </div>
      </div>
    </div>
  )
}

import { cn } from './lib/utils'

export default App