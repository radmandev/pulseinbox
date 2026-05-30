export type SendPulseChannel = 'telegram' | 'whatsapp' | 'instagram' | 'facebook'

interface SendPulseContact {
  id: string
  name: string
  channel: SendPulseChannel
  external_id?: string
}

interface SendPulseConversation {
  id: string
}

interface SendPulseMessage {
  id: string
  text: string
  type?: string
  direction: 'inbound' | 'outbound'
  created_at: string
}

export interface NewMessagePayload {
  event: 'newMessage'
  bot_id: string
  contact: SendPulseContact
  conversation: SendPulseConversation
  message: SendPulseMessage
}

export interface LiveAgentHandoffPayload {
  event: 'liveAgentHandoff'
  bot_id: string
  contact: SendPulseContact
  conversation: SendPulseConversation
  reason?: string
}

export type ParsedEvent =
  | { type: 'new_message'; data: NewMessagePayload }
  | { type: 'live_agent_handoff'; data: LiveAgentHandoffPayload }
  | { type: 'unknown'; raw: unknown }
