import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/queries'
import { exchangeTokens } from '@/lib/sendpulse'

export async function POST() {
  try {
    const config = await getConfig()
    if (!config?.sendpulse_client_id || !config?.sendpulse_client_secret) {
      return NextResponse.json(
        { error: 'No credentials saved. Configure SendPulse credentials first.' },
        { status: 400 }
      )
    }
    const tokenData = await exchangeTokens(
      config.sendpulse_client_id,
      config.sendpulse_client_secret
    )
    return NextResponse.json({ ok: true, expires_in: tokenData.expires_in })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
