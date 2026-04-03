'use client'

import { useEffect, useRef, useState } from 'react'

interface SpendEvent {
  agent_id: string
  amount_usd: number
  total_today_usd: number
  budget_usd: number
  timestamp: string
}

interface LiveSpendState {
  currentSpend: number
  budgetLimit: number
  isConnected: boolean
  lastEvent: SpendEvent | null
}

/**
 * WebSocket hook for real-time spend updates.
 * Gracefully degrades to mock data when WebSocket is unavailable (Sprint 1).
 */
export function useLiveSpend(agentId: string, initialSpend = 0, budgetLimit = 100): LiveSpendState {
  const [state, setState] = useState<LiveSpendState>({
    currentSpend: initialSpend,
    budgetLimit,
    isConnected: false,
    lastEvent: null,
  })
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // TODO(sprint-4): Replace with real WebSocket connection
    // For Sprint 1, simulate live spend updates with mock data
    let mockSpend = initialSpend

    mockIntervalRef.current = setInterval(() => {
      // Simulate occasional spend events (avg 1 request every 3 seconds in demo mode)
      if (Math.random() < 0.3) {
        const delta = Math.random() * 0.005 // $0.001–$0.005 per request
        mockSpend = Math.min(mockSpend + delta, budgetLimit)
        setState((prev) => ({
          ...prev,
          currentSpend: mockSpend,
          isConnected: true, // Mock as connected in demo
          lastEvent: {
            agent_id: agentId,
            amount_usd: delta,
            total_today_usd: mockSpend,
            budget_usd: budgetLimit,
            timestamp: new Date().toISOString(),
          },
        }))
      }
    }, 2000)

    // Attempt real WebSocket connection (will fail gracefully in local dev without backend)
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080'}/ws/spend/${agentId}`

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          // Real connection established — clear mock interval
          if (mockIntervalRef.current) {
            clearInterval(mockIntervalRef.current)
            mockIntervalRef.current = null
          }
          setState((prev) => ({ ...prev, isConnected: true }))
        }

        ws.onmessage = (event: MessageEvent<string>) => {
          try {
            const data = JSON.parse(event.data) as SpendEvent
            setState((prev) => ({
              ...prev,
              currentSpend: data.total_today_usd,
              budgetLimit: data.budget_usd,
              lastEvent: data,
            }))
          } catch {
            // Ignore malformed messages
          }
        }

        ws.onclose = () => {
          setState((prev) => ({ ...prev, isConnected: false }))
          // Reconnect with backoff
          reconnectTimeoutRef.current = setTimeout(connect, 5000)
        }

        ws.onerror = () => {
          ws.close()
        }
      } catch {
        // WebSocket not available — mock data continues
      }
    }

    connect()

    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current)
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [agentId, initialSpend, budgetLimit])

  return state
}
