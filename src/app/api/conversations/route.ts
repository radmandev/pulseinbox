import { NextRequest, NextResponse } from 'next/server'
import { getConversations } from '@/lib/queries'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? undefined
  try {
    const conversations = await getConversations(status)
    return NextResponse.json({ conversations })
  } catch (err) {
    console.error('GET /api/conversations error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
