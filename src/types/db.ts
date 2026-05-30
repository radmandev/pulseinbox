export interface ConversationRow {
  id: string
  sendpulse_conversation_id: string
  sendpulse_bot_id: string | null
  sendpulse_contact_id: string | null
  contact_name: string | null
  channel: 'telegram' | 'whatsapp' | 'instagram' | 'facebook' | null
  status: 'open' | 'pending' | 'closed'
  unread_count: number
  last_message_at: string | null
  created_at: string
}

export interface MessageRow {
  id: string
  conversation_id: string
  sendpulse_message_id: string | null
  sender_name: string | null
  message_text: string | null
  direction: 'inbound' | 'outbound'
  created_at: string
}

export interface ConfigRow {
  id: string
  sendpulse_client_id: string | null
  sendpulse_client_secret: string | null
  sendpulse_access_token: string | null
  token_expires_at: string | null
  created_at: string
}

export interface UpsertConversationInput {
  sendpulse_conversation_id: string
  sendpulse_bot_id?: string
  sendpulse_contact_id?: string
  contact_name?: string
  channel?: string
}

export interface InsertMessageInput {
  conversation_id: string
  sendpulse_message_id?: string
  sender_name?: string
  message_text?: string
  direction: 'inbound' | 'outbound'
  created_at?: string
}

export interface UpsertConfigInput {
  sendpulse_client_id: string
  sendpulse_client_secret: string
  sendpulse_access_token?: string
  token_expires_at?: string
}
