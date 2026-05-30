import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql: postgres.Sql | undefined }

function buildSql(): postgres.Sql {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')
  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Covers both direct (db.*.supabase.co) and pooler (*.pooler.supabase.com)
    ssl: url.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  })
}

const sql: postgres.Sql = globalForDb.sql ?? buildSql()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql
}

export default sql
