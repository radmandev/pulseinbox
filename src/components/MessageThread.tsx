'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { MessageRow } from '@/types/db'
import type { SSEEvent } from '@/types/api'
import { useSSE } from '@/hooks/useSSE'
import MessageBubble from './MessageBubble'

interface Props {
  conversationId: string | null
}

export default function MessageThread({ conversationId }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/conversations/${id}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages ?? [])
      }
    } catch {
      // keep existing messages on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }
    fetchMessages(conversationId)
  }, [conversationId, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSSEEvent = useCallback(
    (event: SSEEvent) => {
      if (
        event.type === 'new_message' &&
        conversationId &&
        event.conversationId === conversationId
      ) {
        fetchMessages(conversationId)
      }
    },
    [conversationId, fetchMessages]
  )

  useSSE(handleSSEEvent)

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm">Select a conversation to view messages</span>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No messages yet
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
