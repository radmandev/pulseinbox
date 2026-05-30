import { NextRequest, NextResponse } from 'next/server'
import { updateConversationStatus } from '@/lib/queries'
import { broadcast } from '@/lib/sse'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: { status?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status } = body
  if (!status || !['open', 'pending', 'closed'].includes(status)) {
    return NextResponse.json(
      { error: 'status must be open, pending, or closed' },
      { status: 400 }
    )
  }

  try {
    const conversation = await updateConversationStatus(params.id, status)
    broadcast({ type: 'status_update', conversationId: params.id })
    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('PATCH /api/conversations/:id/status error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
