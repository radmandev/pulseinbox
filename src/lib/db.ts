import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql: postgres.Sql | undefined }

function createClient(): postgres.Sql {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Add it to your hosting environment variables and redeploy.'
    )
  }
  const isSupabase = dbUrl.includes('supabase.co')
  return postgres(dbUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  })
}

const sql = globalForDb.sql ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql
}

export default sql
