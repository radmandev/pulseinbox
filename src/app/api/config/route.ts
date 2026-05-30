import { NextRequest, NextResponse } from 'next/server'
import { getConfig } from '@/lib/queries'
import { exchangeTokens } from '@/lib/sendpulse'

export async function GET() {
  try {
    const config = await getConfig()
    if (!config) {
      return NextResponse.json({
        config: { sendpulse_client_id: null, token_expires_at: null, connected: false },
      })
    }
    const connected =
      !!config.sendpulse_access_token &&
      !!config.token_expires_at &&
      new Date(config.token_expires_at).getTime() > Date.now()

    return NextResponse.json({
      config: {
        sendpulse_client_id: config.sendpulse_client_id,
        token_expires_at: config.token_expires_at,
        connected,
      },
    })
  } catch (err) {
    console.error('GET /api/config error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: { clientId?: string; clientSecret?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { clientId, clientSecret } = body
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'clientId and clientSecret are required' },
      { status: 400 }
    )
  }

  try {
    const tokenData = await exchangeTokens(clientId, clientSecret)
    return NextResponse.json({ ok: true, expires_in: tokenData.expires_in })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
