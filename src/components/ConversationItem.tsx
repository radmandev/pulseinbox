'use client'

import type { ConversationRow } from '@/types/db'
import ChannelIcon from './ChannelIcon'
import UnreadBadge from './UnreadBadge'

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

interface Props {
  conversation: ConversationRow
  isSelected: boolean
  onClick: () => void
}

export default function ConversationItem({ conversation, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-100 transition-colors hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
      }`}
    >
      <ChannelIcon channel={conversation.channel} size={36} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {conversation.contact_name ?? 'Unknown'}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatTime(conversation.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <span className="text-xs text-gray-500 truncate">
            {conversation.channel ?? 'chat'}
          </span>
          <UnreadBadge count={conversation.unread_count} />
        </div>
      </div>
    </button>
  )
}
