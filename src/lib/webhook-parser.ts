import type { ParsedEvent, NewMessagePayload, LiveAgentHandoffPayload } from '@/types/sendpulse'

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function parseContact(
  c: unknown
): { id: string; name: string; channel: string } | null {
  if (!isObject(c)) return null
  if (typeof c.id !== 'string' || typeof c.name !== 'string') return null
  if (typeof c.channel !== 'string') return null
  return { id: c.id, name: c.name, channel: c.channel }
}

function parseConversation(c: unknown): { id: string } | null {
  if (!isObject(c)) return null
  if (typeof c.id !== 'string') return null
  return { id: c.id }
}

function parseMessage(
  m: unknown
): { id: string; text: string; direction: string; created_at: string } | null {
  if (!isObject(m)) return null
  if (typeof m.id !== 'string') return null
  const text = typeof m.text === 'string' ? m.text : ''
  const direction = m.direction === 'outbound' ? 'outbound' : 'inbound'
  const created_at =
    typeof m.created_at === 'string' ? m.created_at : new Date().toISOString()
  return { id: m.id, text, direction, created_at }
}

export function parseSendPulseEvent(body: unknown): ParsedEvent {
  if (!isObject(body)) return { type: 'unknown', raw: body }

  const event = body.event
  if (typeof event !== 'string') return { type: 'unknown', raw: body }

  const bot_id = typeof body.bot_id === 'string' ? body.bot_id : ''
  const contact = parseContact(body.contact)
  const conversation = parseConversation(body.conversation)

  if (!contact || !conversation) return { type: 'unknown', raw: body }

  if (event === 'newMessage') {
    const message = parseMessage(body.message)
    if (!message) return { type: 'unknown', raw: body }
    return {
      type: 'new_message',
      data: {
        event: 'newMessage',
        bot_id,
        contact: contact as NewMessagePayload['contact'],
        conversation,
        message: message as NewMessagePayload['message'],
      },
    }
  }

  if (event === 'liveAgentHandoff') {
    return {
      type: 'live_agent_handoff',
      data: {
        event: 'liveAgentHandoff',
        bot_id,
        contact: contact as LiveAgentHandoffPayload['contact'],
        conversation,
        reason: typeof body.reason === 'string' ? body.reason : undefined,
      },
    }
  }

  return { type: 'unknown', raw: body }
}
