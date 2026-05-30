import { NextRequest, NextResponse } from 'next/server'
import { getMessages, resetUnreadCount } from '@/lib/queries'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await getMessages(params.id)
    await resetUnreadCount(params.id)
    return NextResponse.json({ messages })
  } catch (err) {
    console.error('GET /api/conversations/:id/messages error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
