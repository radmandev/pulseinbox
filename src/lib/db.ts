import postgres from 'postgres'

type DB = postgres.Sql

const globalForDb = globalThis as unknown as { sql: DB | undefined }

function createClient(): DB {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your Hostinger environment variables.'
    )
  }
  return postgres(dbUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: dbUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  })
}

// Lazy proxy — DB client is only created on first query, not at module import.
// This prevents a missing DATABASE_URL from crashing the process at startup.
export default new Proxy({} as DB, {
  get(_target, prop) {
    if (!globalForDb.sql) {
      globalForDb.sql = createClient()
    }
    return (globalForDb.sql as unknown as Record<string | symbol, unknown>)[prop]
  },
})
