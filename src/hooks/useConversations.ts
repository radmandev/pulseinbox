'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ConversationRow } from '@/types/db'
import type { SSEEvent } from '@/types/api'
import { useSSE } from './useSSE'

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeStatus, setActiveStatus] = useState<string>('open')
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async (status?: string) => {
    const s = status ?? activeStatus
    try {
      const res = await fetch(`/api/conversations?status=${s}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations ?? [])
      }
    } catch {
      // network error — keep existing data
    } finally {
      setLoading(false)
    }
  }, [activeStatus])

  useEffect(() => {
    setLoading(true)
    fetchConversations(activeStatus)
  }, [activeStatus, fetchConversations])

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    if (event.type === 'new_message' || event.type === 'status_update') {
      fetchConversations(activeStatus)
    }
  }, [fetchConversations, activeStatus])

  const { connected } = useSSE(handleSSEEvent)

  return {
    conversations,
    selectedId,
    setSelectedId,
    activeStatus,
    setActiveStatus,
    loading,
    connected,
    refresh: () => fetchConversations(activeStatus),
  }
}
