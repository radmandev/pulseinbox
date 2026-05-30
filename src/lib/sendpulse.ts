import { getConfig, upsertConfig } from './queries'

const API_BASE =
  process.env.SENDPULSE_API_BASE ?? 'https://api.sendpulse.com'

export async function exchangeTokens(
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(`${API_BASE}/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SendPulse auth failed (${res.status}): ${text}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  await upsertConfig({
    sendpulse_client_id: clientId,
    sendpulse_client_secret: clientSecret,
    sendpulse_access_token: data.access_token,
    token_expires_at: expiresAt,
  })

  return data
}

export async function getValidToken(): Promise<string | null> {
  const config = await getConfig()
  if (!config?.sendpulse_access_token) return null

  if (config.token_expires_at) {
    const expiresAt = new Date(config.token_expires_at).getTime()
    if (expiresAt - Date.now() < 60_000) {
      // token expired or expiring soon — refresh
      if (config.sendpulse_client_id && config.sendpulse_client_secret) {
        try {
          const result = await exchangeTokens(
            config.sendpulse_client_id,
            config.sendpulse_client_secret
          )
          return result.access_token
        } catch {
          return null
        }
      }
      return null
    }
  }

  return config.sendpulse_access_token
}
