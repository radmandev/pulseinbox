'use client'

import { useState, useEffect } from 'react'

interface ConfigState {
  sendpulse_client_id: string | null
  token_expires_at: string | null
  connected: boolean
}

export default function SettingsForm() {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [config, setConfig] = useState<ConfigState | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const webhookUrl =
    (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
      : '') + '/api/webhook/sendpulse'

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config)
          if (data.config.sendpulse_client_id) {
            setClientId(data.config.sendpulse_client_id)
          }
        }
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId.trim() || !clientSecret.trim()) return
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Failed to save credentials')
        return
      }
      setStatus('success')
      setConfig((prev) => ({ ...prev!, connected: true }))
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  async function handleRefreshToken() {
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/sendpulse', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Token refresh failed')
        return
      }
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setErrorMsg('Network error.')
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl).catch(() => {})
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Connection status */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            config?.connected ? 'bg-green-500' : 'bg-red-400'
          }`}
        />
        <span className="text-sm text-gray-600">
          SendPulse API:{' '}
          <span className={config?.connected ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {config?.connected ? 'Connected' : 'Not connected'}
          </span>
          {config?.token_expires_at && config.connected && (
            <span className="text-gray-400 text-xs ml-2">
              (token expires {new Date(config.token_expires_at).toLocaleString()})
            </span>
          )}
        </span>
        {config?.connected && (
          <button
            onClick={handleRefreshToken}
            className="ml-auto text-xs text-blue-600 hover:underline"
          >
            Refresh token
          </button>
        )}
      </div>

      {/* Webhook URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Webhook URL
          <span className="ml-1 text-gray-400 font-normal">(register this in SendPulse)</span>
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono"
          />
          <button
            onClick={copyWebhookUrl}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Credentials form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">SendPulse Credentials</h3>

        <div className="space-y-1">
          <label htmlFor="clientId" className="block text-sm text-gray-600">
            Client ID
          </label>
          <input
            id="clientId"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Your SendPulse Client ID"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="clientSecret" className="block text-sm text-gray-600">
            Client Secret
          </label>
          <input
            id="clientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Your SendPulse Client Secret"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {status === 'error' && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
        {status === 'success' && (
          <p className="text-sm text-green-600">Credentials saved and verified.</p>
        )}

        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save & Connect'}
        </button>
      </form>
    </div>
  )
}
