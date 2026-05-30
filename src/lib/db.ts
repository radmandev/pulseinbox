import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql: postgres.Sql | undefined }

function buildSql(): postgres.Sql {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')

  const parsed = new URL(url)

  // DB_PASSWORD lets you provide the raw password without URL-encoding.
  // Some hosting environments corrupt %-encoded characters in env var values.
  const password =
    process.env.DB_PASSWORD ?? decodeURIComponent(parsed.password)

  console.log(`[db] connecting to ${parsed.hostname}:${parsed.port} as ${parsed.username} | pw_len=${password.length}`)

  return postgres({
    host:     parsed.hostname,
    port:     parseInt(parsed.port || '5432', 10),
    database: parsed.pathname.replace(/^\//, ''),
    username: parsed.username,
    password,
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
