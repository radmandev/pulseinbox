import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql: postgres.Sql | undefined }

const dbUrl = process.env.DATABASE_URL!

// Supabase (and most cloud Postgres hosts) require SSL.
// Explicitly set ssl here so it works regardless of how the URL is parsed.
const isSupabase = dbUrl?.includes('supabase.co')

const sql =
  globalForDb.sql ??
  postgres(dbUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql
}

export default sql
