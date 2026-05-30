'use client'

import type { MessageRow } from '@/types/db'

interface Props {
  message: MessageRow
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message }: Props) {
  const isOutbound = message.direction === 'outbound'

  return (
    <div className={`flex flex-col gap-1 ${isOutbound ? 'items-end' : 'items-start'}`}>
      <span className="text-xs text-gray-400 px-1">{message.sender_name ?? (isOutbound ? 'Agent' : 'Contact')}</span>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOutbound
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {message.message_text ?? ''}
      </div>
      <span className="text-[11px] text-gray-400 px-1">{formatTime(message.created_at)}</span>
    </div>
  )
}
