'use strict'

// Entry point for Hostinger hPanel Node.js (Passenger)
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = parseInt(process.env.PORT || '3000', 10)
console.log(`[server] Starting on port ${port} | NODE_ENV=${process.env.NODE_ENV}`)

if (process.env.DATABASE_URL) {
  try {
    const p = new URL(process.env.DATABASE_URL)
    console.log(`[server] DB host=${p.hostname} port=${p.port} user=${p.username}`)
  } catch (e) {
    console.log(`[server] DATABASE_URL set but could not parse: ${e.message}`)
  }
} else {
  console.log('[server] DATABASE_URL NOT SET')
}

const app = next({ dev: false, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    }).listen(port, '0.0.0.0', (err) => {
      if (err) throw err
      console.log(`[server] Ready on http://0.0.0.0:${port}`)
    })
  })
  .catch((err) => {
    console.error('[server] Failed to start:', err)
    process.exit(1)
  })
