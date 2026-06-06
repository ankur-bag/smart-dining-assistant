/**
 * Ensures Supabase pooler URLs are set for Prisma CLI commands.
 * Usage: node scripts/with-db-url.js npx prisma migrate deploy
 */
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const ref = process.env.SUPABASE_PROJECT_REF || 'weejjotpsbufiusfjkip'
const pass = process.env.SUPABASE_DB_PASSWORD
const region = process.env.SUPABASE_REGION || 'ap-northeast-1'
const prefix = process.env.SUPABASE_POOLER_PREFIX || 'aws-1'

if (pass && !process.env.DATABASE_URL?.includes('pooler.supabase.com')) {
  const encoded = encodeURIComponent(pass)
  const host = `${prefix}-${region}.pooler.supabase.com`
  process.env.DATABASE_URL = `postgresql://postgres.${ref}:${encoded}@${host}:6543/postgres?pgbouncer=true`
  process.env.DIRECT_URL = `postgresql://postgres.${ref}:${encoded}@${host}:5432/postgres`
}

if (!process.env.DATABASE_URL) {
  console.error('\n[db] Set DATABASE_URL or SUPABASE_DB_PASSWORD in backend/.env\n')
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/with-db-url.js <command> [args...]')
  process.exit(1)
}

const result = spawnSync(args[0], args.slice(1), {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

process.exit(result.status ?? 1)
