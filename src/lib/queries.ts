import sql from './db'
import type {
  ConversationRow,
  MessageRow,
  ConfigRow,
  UpsertConversationInput,
  InsertMessageInput,
  UpsertConfigInput,
} from '@/types/db'

export async function getConversations(status?: string): Promise<ConversationRow[]> {
  if (status && status !== 'all') {
    return sql<ConversationRow[]>`
      SELECT * FROM conversations
      WHERE status = ${status}
      ORDER BY last_message_at DESC NULLS LAST, created_at DESC
    `
  }
  return sql<ConversationRow[]>`
    SELECT * FROM conversations
    ORDER BY last_message_at DESC NULLS LAST, created_at DESC
  `
}

export async function getConversationById(id: string): Promise<ConversationRow | null> {
  const rows = await sql<ConversationRow[]>`
    SELECT * FROM conversations WHERE id = ${id} LIMIT 1
  `
  return rows[0] ?? null
}

export async function getMessages(conversationId: string): Promise<MessageRow[]> {
  return sql<MessageRow[]>`
    SELECT * FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
  `
}

export async function upsertConversation(
  data: UpsertConversationInput
): Promise<ConversationRow> {
  const rows = await sql<ConversationRow[]>`
    INSERT INTO conversations (
      sendpulse_conversation_id,
      sendpulse_bot_id,
      sendpulse_contact_id,
      contact_name,
      channel,
      last_message_at
    ) VALUES (
      ${data.sendpulse_conversation_id},
      ${data.sendpulse_bot_id ?? null},
      ${data.sendpulse_contact_id ?? null},
      ${data.contact_name ?? null},
      ${data.channel ?? null},
      now()
    )
    ON CONFLICT (sendpulse_conversation_id) DO UPDATE SET
      sendpulse_bot_id = COALESCE(EXCLUDED.sendpulse_bot_id, conversations.sendpulse_bot_id),
      sendpulse_contact_id = COALESCE(EXCLUDED.sendpulse_contact_id, conversations.sendpulse_contact_id),
      contact_name = COALESCE(EXCLUDED.contact_name, conversations.contact_name),
      channel = COALESCE(EXCLUDED.channel, conversations.channel),
      last_message_at = now()
    RETURNING *
  `
  return rows[0]
}

export async function insertMessage(data: InsertMessageInput): Promise<MessageRow> {
  const rows = await sql<MessageRow[]>`
    INSERT INTO messages (
      conversation_id,
      sendpulse_message_id,
      sender_name,
      message_text,
      direction,
      created_at
    ) VALUES (
      ${data.conversation_id},
      ${data.sendpulse_message_id ?? null},
      ${data.sender_name ?? null},
      ${data.message_text ?? null},
      ${data.direction},
      ${data.created_at ? new Date(data.created_at) : sql`now()`}
    )
    RETURNING *
  `
  return rows[0]
}

export async function updateConversationStatus(
  id: string,
  status: string
): Promise<ConversationRow> {
  const rows = await sql<ConversationRow[]>`
    UPDATE conversations SET status = ${status} WHERE id = ${id} RETURNING *
  `
  return rows[0]
}

export async function incrementUnreadCount(conversationId: string): Promise<void> {
  await sql`
    UPDATE conversations SET unread_count = unread_count + 1 WHERE id = ${conversationId}
  `
}

export async function resetUnreadCount(conversationId: string): Promise<void> {
  await sql`
    UPDATE conversations SET unread_count = 0 WHERE id = ${conversationId}
  `
}

export async function getConfig(): Promise<ConfigRow | null> {
  const rows = await sql<ConfigRow[]>`
    SELECT * FROM config ORDER BY created_at DESC LIMIT 1
  `
  return rows[0] ?? null
}

export async function upsertConfig(data: UpsertConfigInput): Promise<ConfigRow> {
  const existing = await getConfig()
  if (existing) {
    const rows = await sql<ConfigRow[]>`
      UPDATE config SET
        sendpulse_client_id = ${data.sendpulse_client_id},
        sendpulse_client_secret = ${data.sendpulse_client_secret},
        sendpulse_access_token = ${data.sendpulse_access_token ?? null},
        token_expires_at = ${data.token_expires_at ? new Date(data.token_expires_at) : null}
      WHERE id = ${existing.id}
      RETURNING *
    `
    return rows[0]
  }
  const rows = await sql<ConfigRow[]>`
    INSERT INTO config (
      sendpulse_client_id,
      sendpulse_client_secret,
      sendpulse_access_token,
      token_expires_at
    ) VALUES (
      ${data.sendpulse_client_id},
      ${data.sendpulse_client_secret},
      ${data.sendpulse_access_token ?? null},
      ${data.token_expires_at ? new Date(data.token_expires_at) : null}
    )
    RETURNING *
  `
  return rows[0]
}
