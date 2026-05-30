-- PulseInbox Phase 1 — initial schema
-- Run once against your PostgreSQL database before starting the app.

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sendpulse_conversation_id text UNIQUE NOT NULL,
  sendpulse_bot_id text,
  sendpulse_contact_id text,
  contact_name text,
  channel text,
  status text DEFAULT 'open',
  unread_count integer DEFAULT 0,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sendpulse_message_id text,
  sender_name text,
  message_text text,
  direction text CHECK (direction IN ('inbound', 'outbound')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sendpulse_client_id text,
  sendpulse_client_secret text,
  sendpulse_access_token text,
  token_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
