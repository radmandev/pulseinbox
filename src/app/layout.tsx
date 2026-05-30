import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PulseInbox — SendPulse Messaging Dashboard',
  description: 'Real-time SendPulse chatbot messaging dashboard for Bitrix24',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
