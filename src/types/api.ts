import type { ConversationRow, MessageRow, ConfigRow } from './db'

export interface ConversationsResponse {
  conversations: ConversationRow[]
}

export interface MessagesResponse {
  messages: MessageRow[]
}

export interface ConfigResponse {
  config: Pick<ConfigRow, 'sendpulse_client_id' | 'token_expires_at'> & {
    connected: boolean
  }
}

export interface StatusUpdateRequest {
  status: 'open' | 'pending' | 'closed'
}

export interface ConfigSaveRequest {
  clientId: string
  clientSecret: string
}

export interface SSEEvent {
  type: 'new_message' | 'status_update'
  conversationId: string
  channel?: string
}

export interface ApiError {
  error: string
}
