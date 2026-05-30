'use client'

interface Props {
  count: number
}

export default function UnreadBadge({ count }: Props) {
  if (count <= 0) return null
  return (
    <span className="ml-1 flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}
