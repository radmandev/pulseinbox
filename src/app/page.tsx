'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useConversations } from '@/hooks/useConversations'
import ConversationList from '@/components/ConversationList'
import MessageThread from '@/components/MessageThread'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BX24: any
  }
}

export default function DashboardPage() {
  const [bxReady, setBxReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.BX24) {
      window.BX24.init(() => {
        setBxReady(true)
        try { window.BX24.fitWindow() } catch { /* not critical */ }
      })
    } else {
      // Running outside Bitrix24 (local dev / direct URL)
      setBxReady(true)
    }
  }, [])

  if (!bxReady) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Initializing…
      </div>
    )
  }

  return <Dashboard />
}

function Dashboard() {
  const {
    conversations,
    selectedId,
    setSelectedId,
    activeStatus,
    setActiveStatus,
    loading,
    connected,
  } = useConversations()

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">PulseInbox</span>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-xs text-gray-500">{connected ? 'Live' : 'Connecting…'}</span>
          </div>
        </div>
        <Link
          href="/settings"
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          title="Settings"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </header>

      {/* Main two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: conversation list */}
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            loading={loading}
          />
        </div>

        {/* Right: message thread */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedId && (
            <ConversationHeader
              conversationId={selectedId}
              conversations={conversations}
            />
          )}
          <MessageThread conversationId={selectedId} />
        </div>
      </div>
    </div>
  )
}

function ConversationHeader({
  conversationId,
  conversations,
}: {
  conversationId: string
  conversations: ReturnType<typeof useConversations>['conversations']
}) {
  const conversation = conversations.find((c) => c.id === conversationId)
  if (!conversation) return null

  async function changeStatus(status: string) {
    await fetch(`/api/conversations/${conversationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {conversation.contact_name ?? 'Unknown'}
        </p>
        <p className="text-xs text-gray-400 capitalize">{conversation.channel ?? 'chat'}</p>
      </div>
      <select
        defaultValue={conversation.status}
        onChange={(e) => changeStatus(e.target.value)}
        className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="open">Open</option>
        <option value="pending">Pending</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  )
}
