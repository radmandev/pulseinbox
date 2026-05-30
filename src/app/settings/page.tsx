'use client'

import Link from 'next/link'
import SettingsForm from '@/components/SettingsForm'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
        <Link
          href="/"
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          title="Back to dashboard"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-sm font-semibold text-gray-800">Settings</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <SettingsForm />
      </div>
    </div>
  )
}
