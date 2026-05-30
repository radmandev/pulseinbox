'use strict'

// Hostinger's network resolves Supabase hostnames to IPv6 addresses that are
// unreachable on port 5432. Resolve the DB host to IPv4 first, then rewrite
// DATABASE_URL so the postgres client never attempts an IPv6 connection.
const dns = require('dns')

async function resolveDbHostToIPv4() {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) return
  try {
    const parsed = new URL(rawUrl)
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve4(parsed.hostname, (err, addrs) =>
        err ? reject(err) : resolve(addrs)
      )
    })
    if (addresses && addresses.length > 0) {
      const ipv4 = addresses[0]
      console.log(`[server] ${parsed.hostname} → ${ipv4} (IPv4)`)
      parsed.hostname = ipv4
      process.env.DATABASE_URL = parsed.toString()
    }
  } catch (err) {
    console.warn(`[server] DNS resolve4 failed, keeping original URL: ${err.message}`)
  }
}

async function main() {
  // Resolve BEFORE requiring next/postgres so the modified DATABASE_URL
  // is picked up when db.ts creates the postgres client on first request.
  await resolveDbHostToIPv4()

  const { createServer } = require('http')
  const { parse } = require('url')
  const next = require('next')

  const port = parseInt(process.env.PORT || '3000', 10)
  console.log(`[server] Starting on port ${port} | NODE_ENV=${process.env.NODE_ENV}`)
  console.log(`[server] DATABASE_URL=${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`)

  const app = next({ dev: false, dir: __dirname })
  const handle = app.getRequestHandler()

  await app.prepare()

  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, '0.0.0.0', (err) => {
    if (err) throw err
    console.log(`[server] Ready on http://0.0.0.0:${port}`)
  })
}

main().catch((err) => {
  console.error('[server] Failed to start:', err)
  process.exit(1)
})
