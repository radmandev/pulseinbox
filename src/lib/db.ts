import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql: postgres.Sql | undefined }

function buildSql(): postgres.Sql {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')

  // Parse the URL explicitly so the password is passed as a raw string
  // (no URL-encoding ambiguity). new URL() percent-decodes .username and
  // .password automatically, which is exactly what postgres.js needs.
  const parsed = new URL(url)

  return postgres({
    host:     parsed.hostname,
    port:     parseInt(parsed.port || '5432', 10),
    database: parsed.pathname.replace(/^\//, ''),
    username: parsed.username,
    password: parsed.password,          // already decoded by new URL()
    max:      10,
    idle_timeout:    20,
    connect_timeout: 10,
    ssl: url.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  })
}

const sql: postgres.Sql = globalForDb.sql ?? buildSql()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql
}

export default sql
