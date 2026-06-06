const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
const frontendEnv = path.join(__dirname, '..', '..', 'frontend', '.env.local')

function loadEnv(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
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

loadEnv(envPath)
loadEnv(frontendEnv)

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    console.error('API: missing SUPABASE_URL or publishable key')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const { data, count, error } = await supabase.from('menu_items').select('*', { count: 'exact' })

  if (error) {
    console.log('API: reachable')
    console.log('MENU_TABLE:', error.code || error.message)
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      console.log('HINT: run prisma migrate + seed to create tables')
    }
    return
  }

  console.log('API: ok')
  console.log('MENU_ITEMS:', count ?? data?.length ?? 0)
  if ((count ?? 0) === 0) {
    console.log('HINT: tables exposed but empty — run: npm run prisma:migrate && npm run seed')
  }
}

main().catch((e) => {
  console.error('API: fail', e.message)
  process.exit(1)
})
