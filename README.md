# PulseInbox — SendPulse Messaging Dashboard (Phase 1)

Real-time messaging dashboard for Bitrix24 that receives SendPulse chatbot/live chat messages via webhook and displays them in a CRM-style conversation UI.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Edit .env.local and set DATABASE_URL and NEXT_PUBLIC_APP_URL
```

### 3. Run the database migration

```bash
psql $DATABASE_URL -f src/lib/migrations/001_initial.sql
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Register the webhook in SendPulse

1. Open **Settings** (gear icon, top-right of the dashboard).
2. Enter your **SendPulse Client ID** and **Client Secret** (from your SendPulse account → API tab).
3. Click **Save & Connect** — the app will verify credentials immediately.
4. Copy the **Webhook URL** shown on the Settings screen.
5. In your SendPulse account, go to the chatbot you want to connect → **Settings → Webhooks** → paste the URL and enable the events: `newMessage`, `liveAgentHandoff`.

---

## Install in Bitrix24

1. Deploy the app to a public URL (Vercel, Railway, Render, etc.).
2. In **Bitrix24 → Applications → Developer resources**, create a new application.
3. Set the **Handler URL** to your deployed root URL (e.g., `https://pulseinbox.vercel.app/`).
4. Install the app in your Bitrix24 account — it will appear as an embedded iframe page.
5. No OAuth scopes are required for Phase 1.

---

## Testing the webhook locally

```bash
# Simulate an incoming message
curl -X POST http://localhost:3000/api/webhook/sendpulse \
  -H "Content-Type: application/json" \
  -d '{
    "event": "newMessage",
    "bot_id": "bot1",
    "contact": { "id": "c1", "name": "Test User", "channel": "telegram" },
    "conversation": { "id": "conv1" },
    "message": {
      "id": "m1",
      "text": "Hello, I need help",
      "direction": "inbound",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }'

# Watch real-time SSE events
curl -N http://localhost:3000/api/events
```

---

## Architecture

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS v3 |
| Database | PostgreSQL (via `postgres` npm package) |
| Real-time | Server-Sent Events (SSE) |
| Deployment | Any Node.js host (Vercel recommended) |

## Supported channels (Phase 1)

- Telegram
- WhatsApp (via SendPulse messaging API)
- Instagram DM
- Facebook Messenger

## Phase 2 (planned)

- Agent replies routed back through SendPulse
- Full Bitrix24 Open Channel integration
- Read receipts and typing indicators
