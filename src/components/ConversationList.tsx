'use client'

import type { ConversationRow } from '@/types/db'
import ConversationItem from './ConversationItem'
import StatusTabs from './StatusTabs'

interface Props {
  conversations: ConversationRow[]
  selectedId: string | null
  onSelect: (id: string) => void
  activeStatus: string
  onStatusChange: (status: string) => void
  loading: boolean
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  activeStatus,
  onStatusChange,
  loading,
}: Props) {
  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
      </div>

      <StatusTabs activeStatus={activeStatus} onChange={onStatusChange} />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            Loading…
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-1 text-sm text-gray-400">
            <span>No {activeStatus} conversations</span>
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isSelected={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
