'use client'

import { useEffect, useRef, useState } from 'react'
import type { SSEEvent } from '@/types/api'

export function useSSE(onEvent: (event: SSEEvent) => void) {
  const [connected, setConnected] = useState(false)
  const callbackRef = useRef(onEvent)
  callbackRef.current = onEvent

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return

    let es: EventSource
    let reconnectTimeout: ReturnType<typeof setTimeout>

    function connect() {
      es = new EventSource('/api/events')

      es.onopen = () => setConnected(true)

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as SSEEvent
          callbackRef.current(data)
        } catch {
          // ignore malformed events
        }
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimeout)
      es?.close()
      setConnected(false)
    }
  }, [])

  return { connected }
}
