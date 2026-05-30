'use client'

const STATUSES = ['open', 'pending', 'closed'] as const

interface Props {
  activeStatus: string
  onChange: (status: string) => void
}

export default function StatusTabs({ activeStatus, onChange }: Props) {
  return (
    <div className="flex border-b border-gray-200 bg-white">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
            activeStatus === s
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
