import { NextRequest, NextResponse } from 'next/server'
import { parseSendPulseEvent } from '@/lib/webhook-parser'
import { upsertConversation, insertMessage, incrementUnreadCount } from '@/lib/queries'
import { broadcast } from '@/lib/sse'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = parseSendPulseEvent(body)

  if (parsed.type === 'new_message') {
    const { data } = parsed
    try {
      const conversation = await upsertConversation({
        sendpulse_conversation_id: data.conversation.id,
        sendpulse_bot_id: data.bot_id,
        sendpulse_contact_id: data.contact.id,
        contact_name: data.contact.name,
        channel: data.contact.channel,
      })

      await insertMessage({
        conversation_id: conversation.id,
        sendpulse_message_id: data.message.id,
        sender_name: data.contact.name,
        message_text: data.message.text,
        direction: data.message.direction,
        created_at: data.message.created_at,
      })

      await incrementUnreadCount(conversation.id)

      broadcast({
        type: 'new_message',
        conversationId: conversation.id,
        channel: data.contact.channel,
      })

      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  if (parsed.type === 'live_agent_handoff') {
    const { data } = parsed
    try {
      const conversation = await upsertConversation({
        sendpulse_conversation_id: data.conversation.id,
        sendpulse_bot_id: data.bot_id,
        sendpulse_contact_id: data.contact.id,
        contact_name: data.contact.name,
        channel: data.contact.channel,
      })

      await insertMessage({
        conversation_id: conversation.id,
        sender_name: 'System',
        message_text: `Live agent handoff${data.reason ? ': ' + data.reason : ''}`,
        direction: 'inbound',
      })

      await incrementUnreadCount(conversation.id)

      broadcast({
        type: 'new_message',
        conversationId: conversation.id,
        channel: data.contact.channel,
      })

      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Unknown event type — acknowledge it anyway so SendPulse doesn't retry
  return NextResponse.json({ ok: true, note: 'event type not handled' })
}
